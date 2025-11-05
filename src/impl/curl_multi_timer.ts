import { Curl, CurlMulti, CurlInfo } from "@tocha688/libcurl"
import { CurlResponse, RequestOptions } from "../type";
import { parseResponse, setRequestOptions } from "../helper";
import { sleep } from "../utils";
import { Logger } from "../logger";
// 避免通过 request/index 的聚合导出引入 session.ts 导致循环依赖
import { storageCurls } from "../request/global";

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
export class CurlMultiTimer extends CurlMulti {
    private forceTimeoutTimer: NodeJS.Timeout | null = null;
    private timers: Array<NodeJS.Timeout> = [];
    curls: Map<string, CurlData> = new Map();
    private sockfds: Set<number> = new Set();

    constructor() {
        super();
        this.setupCallbacks();
        // this.startForceTimeout();
        storageCurls.add(this);
        // this.forceSend();
    }

    /**
     * 设置回调函数
     */
    private setupCallbacks(): void {
        Logger.debug('setupCallbacks - setTimerCallback');
        this.setTimerCallback((err, args) => {
            if (err) {
                Logger.error(err)
                return;
            }
            if (args.timeoutMs == -1) {
                this.timers.forEach((timer) => clearTimeout(timer));
                this.timers = [];
                this.checkProcess();
            } else {
                this.timers.push(setTimeout(() => {
                    Logger.debug('CurlMultiTimer - setTimerCallback - timeout', args.timeoutMs);
                    this.processData();
                }, args.timeoutMs));
            }
        });
    }
    private isRunning=false;
    private async waitResult() {
        if(this.isRunning)return;
        this.isRunning=true;
        return await Promise.resolve().then(async () => {
            do {
                await this.wait(10000)
                await this.processData();
            } while (this.curls.size > 0)
        })
    }

    private processData(): void {
        if (this.closed) return;
        try {
            // Logger.debug('CurlMultiTimer - perform - start');
            const runSize = this.perform();
            if (runSize <= 0) {
                // this.stopForceTimeout();
                // Logger.error('CurlMultiTimer - perform', runSize);
                if (this.curls.size > 0) {
                    //可能需要全部失败
                }
                return;
            } else {
                this.checkProcess();
            }
        } catch (error) {
            Logger.error('CurlMultiTimer - error', error);
            // console.log('执行 socket action 时出错:', error);
        }
    }

    private isCecker = false;
    private checkProcess() {
        if (this.isCecker) return;
        try {
            while (true) {
                // Logger.debug(`CurlMultiTimer - checkProcess - infoRead start`);
                const msg = this.infoRead();
                // Logger.debug(`CurlMultiTimer - checkProcess - infoRead end`);
                if (!msg) {
                    break;
                }
                Logger.warn(`CurlMultiTimer - Message`, msg);
                if (msg.msg === CURLMSG_DONE) {
                    const call = this.curls.get(msg.easyId);
                    if (!call || !msg.data) continue;
                    this.curls.delete(msg.easyId);
                    this.removeHandle(call.curl);
                    if (msg.data.result == 0) {
                        Logger.debug(`CurlMultiTimer - getInfoNumber - start`, msg.easyId);
                        const status = call.curl.getInfoNumber(CurlInfo.ResponseCode) || 200;
                        Logger.debug(`CurlMultiTimer - getInfoNumber - end`, msg.easyId);
                        if (status < 100) {
                            call.reject(new Error(call.curl.error(status)));
                        } else {
                            call.resolve(parseResponse(call.curl, call.options));
                        }
                    } else {
                        call.reject(new Error(call.curl.error(msg.data.result)));
                    }
                    Logger.debug(`CurlMultiTimer - checkProcess - DONE`);
                    // call.curl.close();
                    Logger.debug(`CurlMultiTimer - checkProcess - DONE OK`);
                } else {
                    Logger.warn(`CurlMultiTimer - checkProcess - NOT DONE`, msg);
                }
            }
        } catch (e) {
            Logger.error('处理完成消息时出错', e);
        } finally {
            this.isCecker = false;
        }
    }

    async request(ops: RequestOptions, curl: Curl): Promise<any> {
        return new Promise((resolve, reject) => {
            this.curls.set(curl.id(), {
                options: ops,
                curl,
                resolve,
                reject
            });
            Logger.debug(`CurlMultiTimer - request - addHandle start`);
            this.addHandle(curl);
            Logger.debug(`CurlMultiTimer - request - addHandle end`);
            // this.performSocketAction(CURL_SOCKET_TIMEOUT, 0);
            // 立即触发一次socket action来启动请求
            this.waitResult();
            setImmediate(() => {
                if (!this.closed) {
                    this.processData();
                }
            });
        });
    }

    close(): void {
        storageCurls.delete(this);
        if (this.closed) return;
        Logger.debug(`CurlMultiTimer - close start`);

        // 清理强制超时定时器
        if (this.forceTimeoutTimer) {
            clearInterval(this.forceTimeoutTimer);
            this.forceTimeoutTimer = null;
        }

        super.close();
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


