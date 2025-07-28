import { Curl, CurlMOpt } from "@tocha688/libcurl";
import { CurlMultiImpl, request, requestSync } from "../impl";
import { CurlOptions, CurlResponse, defaultRequestOption, RequestEvent, RequestOptions, ResponseEvent } from "../type";
import _ from "lodash";
import { setRequestOptions } from "../helper";

type RequestData = Record<string, any> | string | URLSearchParams;


export class CurlRequestImplBase {
    constructor(
        public baseOptions: RequestOptions = _.clone(defaultRequestOption)
    ) {
        this.init()
    }
    protected init() { }

    protected request(options: RequestOptions): Promise<CurlResponse> {
        throw new Error("Method not implemented.");
    }

    protected async beforeRequest(options: RequestOptions): Promise<CurlResponse> {
        return this.request(options);
    }

    get(url: string, options?: RequestOptions): Promise<CurlResponse> {
        return this.beforeRequest({
            url,
            method: "GET",
            ...options,
        })
    }
    post(url: string, data?: RequestData, options?: RequestOptions): Promise<CurlResponse> {
        return this.beforeRequest({
            url,
            method: "POST",
            data,
            ...options,
        })
    }
    put(url: string, data?: RequestData, options?: RequestOptions): Promise<CurlResponse> {
        return this.beforeRequest({
            url,
            method: "PUT",
            data,
            ...options,
        })
    }
    delete(url: string, data?: RequestData, options?: RequestOptions): Promise<CurlResponse> {
        return this.beforeRequest({
            url,
            method: "DELETE",
            data,
            ...options,
        })
    }
    patch(url: string, data?: RequestData, options?: RequestOptions): Promise<CurlResponse> {
        return this.beforeRequest({
            url,
            method: "PATCH",
            data,
            ...options,
        })
    }
    head(url: string, options?: RequestOptions): Promise<CurlResponse> {
        return this.beforeRequest({
            url,
            method: "HEAD",
            ...options,
        })
    }
    options(url: string, options?: RequestOptions): Promise<CurlResponse> {
        return this.beforeRequest({
            url,
            method: "OPTIONS",
            ...options,
        })
    }

    get jar() {
        return this.baseOptions.jar;
    }
}

export class CurlClient extends CurlRequestImplBase {
    private multi?: CurlMultiImpl;
    constructor(ops?: CurlOptions) {
        super(ops);
        ops = _.merge({}, defaultRequestOption, ops);
        this.multi = ops?.impl;
        this.initOptions(ops);
    }

    private reqs: Array<RequestEvent> = [];
    private resps: Array<ResponseEvent> = [];
    private async emits<T>(options: T, calls: Array<(data: T) => Promise<T>>): Promise<T> {
        for (const call of calls) {
            options = await call(options);
        }
        return options;
    }
    onRequest(event: RequestEvent) {
        if (this.reqs.indexOf(event) === -1) {
            this.reqs.push(event);
        }
    }
    onResponse(event: ResponseEvent) {
        if (this.resps.indexOf(event) === -1) {
            this.resps.push(event);
        }
    }
    private initOptions(ops?: CurlOptions) {
        if (!ops) return;
        if (!this.multi) return;
        if (ops.keepAlive == false) {
            this.multi.setOptLong(CurlMOpt.Pipelining, 1)
        } else {
            this.multi.setOptLong(CurlMOpt.Pipelining, 2)
        }
        this.multi.setOptLong(CurlMOpt.Pipelining, 2)
        this.multi.setOptLong(CurlMOpt.MaxConnects, ops.MaxConnects ?? 10);
        this.multi.setOptLong(CurlMOpt.MaxConcurrentStreams, ops.MaxConcurrentStreams ?? 500);
    }

    protected async send(options: RequestOptions, curl: Curl): Promise<CurlResponse> {
        if (this.multi) {
            return await this.multi.request(options, curl);
        } else if (options.sync) {
            return await requestSync(options, curl);
        } else {
            return await request(options, curl);
        }
    }

    protected getCurl(): Curl {
        return new Curl();
    }

    protected async beforeResponse(options: RequestOptions, curl: Curl, res: CurlResponse): Promise<CurlResponse> {
        curl.close();
        return res;
    }

    override async request(options: RequestOptions): Promise<CurlResponse> {
        let curl = this.getCurl();
        //cors
        const opts = _.merge({}, this.baseOptions, options)
        if (opts.cors) {
            //先预检
            const corsOpts = _.merge({}, opts, {
                method: "OPTIONS"
            })
            //初始化请求
            await setRequestOptions(curl, corsOpts);
            await this.send(corsOpts, curl);
        }
        //其他正常请求
        let retryCount = this.baseOptions?.retryCount ?? 0;
        let result: CurlResponse | undefined;
        do {
            try {
                //重置curl
                curl.reset();
                //初始化参数
                await setRequestOptions(curl, opts);
                //调用参数
                await this.emits(options, this.reqs);
                result = await this.send(options, curl);
                //成功退出
                break;
            } catch (e) {
                if (retryCount <= 0) {
                    throw e;
                }
                //重试
                console.warn(`Request failed, retrying... (${retryCount} retries left)`, e);
            }
        } while (retryCount-- > 0);
        //调用响应
        await this.emits(result as CurlResponse, this.resps);
        return this.beforeResponse(options, curl, result as CurlResponse);
    }

    close() {
        this.multi?.close();
    }
    setImpl(impl?: CurlMultiImpl) {
        this.multi = impl
    }
    getImpl(): CurlMultiImpl | undefined {
        return this.multi;
    }
}

