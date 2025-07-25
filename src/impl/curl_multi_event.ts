import { Curl, CurlMulti, CurlInfo } from "@tocha688/libcurl"
import { CurlResponse, RequestOptions } from "../type";
import { parseResponse, setRequestOptions } from "../helper";
import { sleep } from "../utils";
import { Logger } from "../logger";
import { Socket } from "net";
import { SocketChecker } from "../socket/SocketChecker";

const CURL_POLL_NONE = 0
const CURL_POLL_IN = 1
const CURL_POLL_OUT = 2
const CURL_POLL_INOUT = 3
const CURL_POLL_REMOVE = 4

const CURL_SOCKET_TIMEOUT = -1
const CURL_SOCKET_BAD = -1

const CURL_CSELECT_IN = 0x01
const CURL_CSELECT_OUT = 0x02
const CURL_CSELECT_ERR = 0x04

const CURLMSG_DONE = 1


type CurlData = {
    curl: Curl;
    options: RequestOptions;
    resolve: (res: CurlResponse | PromiseLike<CurlResponse>) => void;
    reject: (err?: Error) => void;
}
export class CurlMultiEvent extends CurlMulti {
    private forceTimeoutTimer: NodeJS.Timeout | null = null;
    private timers = new Set<NodeJS.Timeout>();
    curls: Map<string, CurlData> = new Map();
    private loop: SocketChecker = new SocketChecker();
    private sockfds: Set<number> = new Set();

    constructor() {
        super();
        this.setupCallbacks();
        this.startForceTimeout();
    }
    private startForceTimeout(): void {
        if (this.forceTimeoutTimer) {
            clearInterval(this.forceTimeoutTimer);
        }

        this.forceTimeoutTimer = setInterval(() => {
            if (this.closed) return;
            Logger.debug('Force timeout triggered');
            this.socketAction(CURL_SOCKET_TIMEOUT, CURL_POLL_NONE);
        }, 1000);

        // 不阻塞进程退出
        this.forceTimeoutTimer.unref();
    }

    private setupCallbacks(): void {
        Logger.debug('setupCallbacks - setSocketCallback and setTimerCallback');
        this.setSocketCallback((err, { curlId, sockfd, what }) => {
            if (err != null) {
                Logger.error(err)
                return
            }
            Logger.debug(`CurlMultiEvent - socketCallback: sockfd=${sockfd}, what=${what}`);

            // 先清理现有的监听
            if (this.sockfds.has(sockfd)) {
                this.loop.removeReader(sockfd);
                this.loop.removeWriter(sockfd);
                // this.sockfds.delete(sockfd);
            }

            // 根据 what 值添加相应的监听
            if (what & CURL_POLL_IN) {
                this.loop.addReader(sockfd, (sockfd, event_type) => {
                    if (this.sockfds.has(sockfd) && !this.closed) {
                        Logger.debug(`Socket readable: sockfd=${sockfd}`);
                        this.processData(sockfd, CURL_CSELECT_IN);
                    }
                });
                this.sockfds.add(sockfd);
            }

            if (what & CURL_POLL_OUT) {
                this.loop.addWriter(sockfd, (sockfd, event_type) => {
                    if (this.sockfds.has(sockfd) && !this.closed) {
                        Logger.debug(`Socket writable: sockfd=${sockfd}`);
                        this.processData(sockfd, CURL_CSELECT_OUT);
                    }
                });
                this.sockfds.add(sockfd);
            }

            if (what & CURL_POLL_REMOVE) {
                this.sockfds.delete(sockfd);
            }

        });

        this.setTimerCallback((err,{ timeoutMs }) => {
            if (err != null) {
                Logger.error(err)
                return
            }
            Logger.debug(`CurlMultiEvent - timerCallback: timeout_ms=${timeoutMs}`);
            if (timeoutMs == -1) {
                this.timers.forEach((timer) => clearTimeout(timer));
                this.timers.clear();
            } else {
                const timer = setTimeout(() => {
                    this.processData(CURL_SOCKET_TIMEOUT, CURL_POLL_NONE);
                    this.timers.delete(timer);
                }, timeoutMs);
                this.timers.add(timer);
            }
        });
    }

    private processData(sockfd: number, evBitmask: number): void {
        if (this.closed) return;
        try {
            // Logger.debug('CurlMultiEvent - socketAction - start', { sockfd, evBitmask });
            let runSize = this.socketAction(sockfd, evBitmask);
            Logger.debug('CurlMultiEvent - socketAction - end', { sockfd, evBitmask, runSize });
            // 检查是否有完成的传输
            this.checkProcess();
        } catch (error) {
            Logger.error('CurlMultiEvent - processData error:', error);
        }
    }

    private checkProcess() {
        try {
            while (true) {
                const curl_msg = this.infoRead();
                if (!curl_msg) {
                    break;
                }
                if (curl_msg.msg === CURLMSG_DONE) {
                    const call = this.curls.get(curl_msg.easyId);
                    if (!call || !curl_msg.data) continue;
                    this.curls.delete(curl_msg.easyId);
                    const retcode = curl_msg.data.result
                    if (retcode == 0) {
                        call.resolve(parseResponse(call.curl, call.options));
                    } else {
                        call.reject(new Error(call.curl.error(retcode)));
                    }
                    this.removeHandle(call.curl);
                    // call.curl.reset();
                } else {
                    Logger.warn(`CurlMultiEvent - checkProcess - NOT DONE`, curl_msg);
                }
            }
        } catch (e) {
            Logger.error('CurlMultiEvent - 处理完成消息时出错:', e);
        } finally {
        }
    }

    async request(ops: RequestOptions): Promise<CurlResponse> {
        return new Promise((resolve, reject) => {
            const curl = ops.curl ?? new Curl();
            if (ops.curl) ops.curl.reset()
            setRequestOptions(curl, ops);
            this.curls.set(curl.id(), {
                options: ops,
                curl,
                resolve,
                reject
            });
            Logger.debug(`CurlMultiEvent - request - addHandle start`);
            this.addHandle(curl);
            Logger.debug(`CurlMultiEvent - request - addHandle end`);
            // this.performSocketAction(CURL_SOCKET_TIMEOUT, 0);
            setImmediate(() => {
                if (this.closed) return;
                this.processData(CURL_SOCKET_TIMEOUT, CURL_POLL_NONE);
            });
        });
    }

    close(): void {
        if (this.closed) return;
        Logger.debug(`CurlMultiEvent - close start`);

        // 清理强制超时定时器
        if (this.forceTimeoutTimer) {
            clearInterval(this.forceTimeoutTimer);
            this.forceTimeoutTimer = null;
        }

        super.close();

        // 清理事件监听
        this.sockfds.forEach((sockfd) => {
            this.loop.removeReader(sockfd);
            this.loop.removeWriter(sockfd);
        });
        this.sockfds.clear();

        // 清理定时器
        this.timers.forEach((timer) => clearTimeout(timer));
        this.timers.clear();

        // 清理回调
        this.curls.forEach((call) => {
            call.reject(new Error('CurlPools is closed'));
        });
        this.curls.clear();

        Logger.debug(`CurlMultiEvent - close end`);
    }

}