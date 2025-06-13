import { CurlResponse, defaultRequestOption, RequestOptions } from "../type";
import _ from "lodash";

type RequestData = Record<string, any> | string | URLSearchParams;

export class CurlRequestBase {
    constructor(
        public baseOptions: RequestOptions = _.clone(defaultRequestOption)
    ) {

    }

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
}

