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
    protected init(){}

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
        this.multi =ops?.impl;
    }
    async request(options: RequestOptions): Promise<CurlResponse> {
        if (this.multi) {
            return this.multi.request(options);
        }
        //同步
        return requestSync(options);
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