import { CurlMOpt } from "@tocha688/libcurl";
import { CurlMultiEvent, CurlMultiTimer, requestSync } from "../impl";
import { CurlResponse, defaultRequestOption, RequestOptions } from "../type";
import _ from "lodash";

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

    private beforeRequest(options: RequestOptions): Promise<CurlResponse> {
        return this.request(_.merge({}, this.baseOptions, options));
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

export class CurlRequestBase extends CurlRequestImplBase {
    private multi?: CurlMultiEvent | CurlMultiTimer;
    constructor(ops?: RequestOptions) {
        super(ops);
        this.multi = ops?.impl;
        this.initOptions(ops);
    }
    private initOptions(ops?: RequestOptions) {
        if (!ops) return;
        if (!this.multi) return;
        if (ops.keepAlive == false) {
            this.multi.setOptLong(CurlMOpt.Pipelining, 1)
        } else {
            this.multi.setOptLong(CurlMOpt.Pipelining, 2)
        }
        this.multi.setOptLong(CurlMOpt.MaxConnects, ops.maxRecvSpeed ?? 10);
    }
    async request(options: RequestOptions): Promise<CurlResponse> {
        let retryCount = this.baseOptions?.retryCount ?? 0;
        let result: CurlResponse | undefined;
        do {
            try {
                if (this.multi) {
                    result = await this.multi.request(options);
                } else {
                    //同步
                    result = await requestSync(options);
                }
            } catch (e) {
                if (retryCount <= 0) {
                    throw e;
                }
                //重试
                console.warn(`Request failed, retrying... (${retryCount} retries left)`, e);
            }
        } while (retryCount-- > 0);
        return result as CurlResponse;
    }
    close() {
        this.multi?.close();
    }
    setImpl(impl?: CurlMultiEvent | CurlMultiTimer) {
        this.multi = impl
    }
    getImpl(): CurlMultiEvent | CurlMultiTimer | undefined {
        return this.multi;
    }
}