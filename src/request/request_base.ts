import { Curl, CurlMOpt } from "@tocha688/libcurl";
import { CurlMultiImpl, request, requestSync } from "../impl";
import { CurlOptions, CurlResponse, defaultRequestOption, RequestOptions } from "../type";
import _, { method } from "lodash";

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

    private async beforeRequest(options: RequestOptions): Promise<CurlResponse> {
        const opts = _.merge({}, this.baseOptions, options)
        if (opts.cors) {
            //先预检
            const res = await this.request(_.merge({}, opts, {
                method: "OPTIONS"
            }));
            opts.curl = res.curl
        }
        return this.request(opts);
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
    private multi?: CurlMultiImpl;
    constructor(ops?: CurlOptions) {
        super(ops);
        this.multi = ops?.impl;
        this.initOptions(ops);
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

    protected async send(options: RequestOptions): Promise<CurlResponse> {
        if (this.multi) {
            return await this.multi.request(options);
        } else {
            return await request(options);
        }
    }

    override async request(options: RequestOptions): Promise<CurlResponse> {
        let retryCount = this.baseOptions?.retryCount ?? 0;
        let result: CurlResponse | undefined;
        do {
            try {
                result = await this.send(options);
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
    setImpl(impl?: CurlMultiImpl) {
        this.multi = impl
    }
    getImpl(): CurlMultiImpl | undefined {
        return this.multi;
    }
}

