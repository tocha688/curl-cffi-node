import { Curl, CurlMulti, AsyncEventLoop } from "@tocha688/libcurl"
import { CurlResponse, RequestOptions } from "../type";
import { parseResponse, setRequestOptions } from "../helper";
import { sleep } from "../utils";

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
    resolve: (res?: CurlResponse) => void;
    reject: (err?: Error) => void;
}
export class CurlPools extends CurlMulti {
    private forceTimeoutTimer: NodeJS.Timeout | null = null;
    private timers: Array<NodeJS.Timeout> = [];
    curls: Map<string, CurlData> = new Map();
    private loop: AsyncEventLoop = new AsyncEventLoop();
    private sockfds: Set<number> = new Set();

    constructor() {
        super();
        this.setupCallbacks();
        this.startForceTimeout();
    }

    private startForceTimeout(): void {
        const forceTimeout = () => {
            if (this.closed) return;

            // 强制处理超时，确保请求不会卡住
            this.processData(CURL_SOCKET_TIMEOUT, CURL_POLL_NONE);

            this.forceTimeoutTimer = setTimeout(forceTimeout, 1000);
        };

        this.forceTimeoutTimer = setTimeout(forceTimeout, 1000);
    }

    /**
     * 设置回调函数
     */
    private setupCallbacks(): void {
        this.setSocketCallback(({ curl_id, sockfd, what }) => {
            console.log(`Socket 回调: sockfd=${sockfd}, what=${what}`);
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
            if (timeout_ms == -1) {
                this.timers.forEach((timer) => clearTimeout(timer));
                this.timers = [];
            } else {
                console.log(`定时器回调: timeout=${timeout_ms}ms`);
                this.timers.push(setTimeout(() => {
                    console.log('定时器触发');
                    this.processData(CURL_SOCKET_TIMEOUT, CURL_POLL_NONE);
                }, timeout_ms));
            }
        });
    }
    private processData(sockfd: number, evBitmask: number): void {
        console.log(`处理数据: sockfd=${sockfd}, evBitmask=${evBitmask}`);
        if (this.closed) return;
        try {
            const runSize = this.socketAction(sockfd, evBitmask);
            console.log(`当前运行中的句柄数: ${runSize}`);
            // 检查是否有完成的传输
            this.curls.size > 0 && this.checkProcess();
        } catch (error) {
            console.log('执行 socket action 时出错:', error);
        }
    }

    private checkProcess() {
        while (true) {
            const msg = this.infoRead();
            if (!msg) {
                break;
            }
            console.log('获取到消息', msg);
            if (msg.msg === CURLMSG_DONE) {
                const call = this.curls.get(msg.easyId);
                if (!call || !msg.data) continue;
                this.curls.delete(msg.easyId);
                if (msg.data.result == 0) {
                    call.resolve(parseResponse(call.curl, call.options));
                } else {
                    call.reject(new Error(call.curl.error(msg.data.result)));
                }
                call.curl.close();
            } else {
                console.log(`NOT DONE`);
            }
        }
    }

    async request(ops: RequestOptions): Promise<any> {
        return new Promise((resolve, reject) => {
            const curl = new Curl();
            setRequestOptions(curl, ops);
            this.curls.set(curl.id(), {
                options: ops,
                curl,
                resolve,
                reject
            });
            this.addHandle(curl);
            // this.performSocketAction(CURL_SOCKET_TIMEOUT, 0);
            // 立即触发一次socket action来启动请求
            setImmediate(() => {
                if (!this.closed) {
                    this.processData(CURL_SOCKET_TIMEOUT, CURL_POLL_NONE);
                }
            });
        });
    }

    close(): void {
        if (this.closed) return;

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
    }

}


