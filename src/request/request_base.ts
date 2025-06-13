import { CurlResponse, RequestOptions } from "../type";

export class CurlRequestBase {
    constructor() {
    }

    protected request(options: RequestOptions): Promise<CurlResponse> {
        throw new Error("Method not implemented.");
    }

    get(url: string, options?: RequestOptions): Promise<CurlResponse> {
        return this.request({
            url,
            method: "GET",
            ...options,
        })
    }
    post(url: string, data?: Record<string, any> | string, options?: RequestOptions): Promise<CurlResponse> {
        return this.request({
            url,
            method: "POST",
            data,
            ...options,
        })
    }
    put(url: string, data?: Record<string, any> | string, options?: RequestOptions): Promise<CurlResponse> {
        return this.request({
            url,
            method: "PUT",
            data,
            ...options,
        })
    }
    delete(url: string, data?: Record<string, any> | string, options?: RequestOptions): Promise<CurlResponse> {
        return this.request({
            url,
            method: "DELETE",
            data,
            ...options,
        })
    }
    patch(url: string, data?: Record<string, any> | string, options?: RequestOptions): Promise<CurlResponse> {
        return this.request({
            url,
            method: "PATCH",
            data,
            ...options,
        })
    }
    head(url: string, options?: RequestOptions): Promise<CurlResponse> {
        return this.request({
            url,
            method: "HEAD",
            ...options,
        })
    }
    options(url: string, options?: RequestOptions): Promise<CurlResponse> {
        return this.request({
            url,
            method: "OPTIONS",
            ...options,
        })
    }
}

