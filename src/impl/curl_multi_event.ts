import { Curl, CurlMulti, AsyncEventLoop, CurlInfo } from "@tocha688/libcurl"
import { CurlResponse, RequestOptions } from "../type";
import { parseResponse, setRequestOptions } from "../helper";
import { sleep } from "../utils";
import { Logger } from "../logger";

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
    private timers: Array<NodeJS.Timeout> = [];
    curls: Map<string, CurlData> = new Map();
    private loop: AsyncEventLoop = new AsyncEventLoop();
    private sockfds: Set<number> = new Set();

    constructor() {
        super();
        this.setupCallbacks();
        // this.startForceTimeout();
    }

    private isStartLoopCheck = false;
    private startForceTimeout(): void {
        if (this.isStartLoopCheck || this.closed || this.curls.size < 1) return
        this.isStartLoopCheck = true;
        Logger.debug('CurlMultiEvent - startForceTimeout');
        const close = () => {
            this.isStartLoopCheck = false;
            Logger.debug('CurlMultiEvent - forceTimeout closed');
        }
        const forceTimeout = () => {
            if (this.closed || this.curls.size < 1) return close();
            this.processData(CURL_SOCKET_TIMEOUT, CURL_POLL_NONE);
            this.forceTimeoutTimer = setTimeout(forceTimeout, 1000);
            this.forceTimeoutTimer?.unref(); // 允许进程退出
        };
        this.forceTimeoutTimer = setTimeout(forceTimeout, 1000);
        this.forceTimeoutTimer?.unref(); // 允许进程退出
    }

    /**
     * 设置回调函数
     */
    private setupCallbacks(): void {
        Logger.debug('setupCallbacks - setSocketCallback and setTimerCallback');
        this.setSocketCallback(({ curl_id, sockfd, what }) => {
            Logger.debug(`CurlMultiEvent - socketCallback: sockfd=${sockfd}, what=${what}`);
            // 先清理现有的读写器
            if (this.sockfds.has(sockfd)) {
                this.loop.removeReader(sockfd);
                this.loop.removeWriter(sockfd);
            }
            // 根据what值添加相应的读写器
            if (what === CURL_POLL_IN) {
                this.loop.addReader(sockfd, (sockfd, event_type) => {
                    if (this.sockfds.has(sockfd) && !this.closed) {
                        this.processData(sockfd, CURL_CSELECT_IN);
                    }
                });
                this.sockfds.add(sockfd);
            } else if (what === CURL_POLL_OUT) {
                this.loop.addWriter(sockfd, (sockfd, event_type) => {
                    if (this.sockfds.has(sockfd) && !this.closed) {
                        this.processData(sockfd, CURL_CSELECT_OUT);
                    }
                });
                this.sockfds.add(sockfd);
            } else if (what === CURL_POLL_INOUT) {
                // 同时处理读写
                this.loop.addReader(sockfd, (sockfd, event_type) => {
                    if (this.sockfds.has(sockfd) && !this.closed) {
                        this.processData(sockfd, CURL_CSELECT_IN);
                    }
                });
                this.loop.addWriter(sockfd, (sockfd, event_type) => {
                    if (this.sockfds.has(sockfd) && !this.closed) {
                        this.processData(sockfd, CURL_CSELECT_OUT);
                    }
                });
                this.sockfds.add(sockfd);
            } else if (what === CURL_POLL_REMOVE) {
                this.loop.removeReader(sockfd);
                this.loop.removeWriter(sockfd);
                this.sockfds.delete(sockfd);
            }
        });

        this.setTimerCallback(({ timeout_ms }) => {
            Logger.debug(`CurlMultiEvent - timerCallback: timeout_ms=${timeout_ms}`);
            if (timeout_ms == -1) {
                this.timers.forEach((timer) => clearTimeout(timer));
                this.timers = [];
            } else {
                this.timers.push(setTimeout(() => {
                    this.processData(CURL_SOCKET_TIMEOUT, CURL_POLL_NONE);
                }, timeout_ms));
            }
        });
    }

    private processData(sockfd: number, evBitmask: number): void {
        if (this.closed) return;
        try {
            Logger.debug('CurlMultiEvent - socketAction - start', { sockfd, evBitmask });
            const runSize = this.socketAction(sockfd, evBitmask);
            Logger.debug('CurlMultiEvent - socketAction - end', { sockfd, evBitmask, runSize });
            // 检查是否有完成的传输
            this.curls.size > 0 && this.checkProcess();
        } catch (error) {
            Logger.error('CurlMultiEvent - processData error:', error);
        }
    }

    private isCecker = false;
    private checkProcess() {
        if (this.isCecker) return;
        this.isCecker = true;
        try {
            while (true) {
                Logger.debug(`CurlMultiEvent - checkProcess - infoRead start`);
                const msg = this.infoRead();
                Logger.debug(`CurlMultiEvent - checkProcess - infoRead end`, msg);
                if (!msg) {
                    break;
                }
                if (msg.msg === CURLMSG_DONE) {
                    const call = this.curls.get(msg.easyId);
                    if (!call || !msg.data) continue;
                    this.curls.delete(msg.easyId);
                    if (msg.data.result == 0) {
                        Logger.debug(`CurlMultiEvent - getInfoNumber - start`, msg.easyId);
                        const status = call.curl.getInfoNumber(CurlInfo.ResponseCode) || 200;
                        Logger.debug(`CurlMultiEvent - getInfoNumber - end`, msg.easyId);
                        if (status < 100) {
                            call.reject(new Error(call.curl.error(status)));
                        } else {
                            call.resolve(parseResponse(call.curl, call.options));
                        }
                    } else {
                        call.reject(new Error(call.curl.error(msg.data.result)));
                    }
                    this.removeHandle(call.curl);
                    call.curl.close();
                } else {
                    Logger.warn(`CurlMultiEvent - checkProcess - NOT DONE`, msg);
                }
            }
        } catch (e) {
            Logger.error('CurlMultiEvent - 处理完成消息时出错:', e);
        } finally {
            this.isCecker = false;
        }
    }

    async request(ops: RequestOptions): Promise<CurlResponse> {
        return new Promise((resolve, reject) => {
            const curl = new Curl();
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
            // 立即触发一次socket action来启动请求
            this.startForceTimeout();
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
            clearTimeout(this.forceTimeoutTimer);
            this.forceTimeoutTimer = null;
        }
        super.close();
        //清理事件
        this.sockfds.forEach((sockfd) => {
            this.loop.removeReader(sockfd);
            this.loop.removeWriter(sockfd);
        });
        this.sockfds.clear();
        //清理timers
        this.timers.forEach((timer) => clearTimeout(timer));
        this.timers = [];
        //回调
        this.curls.forEach((call) => {
            call.reject(new Error('CurlPools is closed'));
        });
        this.curls.clear();

        Logger.debug(`CurlMultiEvent - close end`);
    }

}