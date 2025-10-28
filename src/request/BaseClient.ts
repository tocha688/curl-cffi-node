import { CurlResponse, RequestOptions } from "../type";

export type RequestData = Record<string, any> | string | URLSearchParams;

/**
 * 提供统一的便捷方法，实现于基类，具体的请求由子类实现。
 * 子类只需实现 request(options) 即可复用 get/post/... 方法。
 */
export abstract class BaseClient {
  abstract request(options: RequestOptions): Promise<CurlResponse>;

  get(url: string, options?: RequestOptions): Promise<CurlResponse> {
    return this.request({ ...options, url, method: "GET" });
  }

  post(url: string, data?: RequestData, options?: RequestOptions): Promise<CurlResponse> {
    return this.request({ ...options, url, method: "POST", data });
  }

  put(url: string, data?: RequestData, options?: RequestOptions): Promise<CurlResponse> {
    return this.request({ ...options, url, method: "PUT", data });
  }

  delete(url: string, data?: RequestData, options?: RequestOptions): Promise<CurlResponse> {
    return this.request({ ...options, url, method: "DELETE", data });
  }

  patch(url: string, data?: RequestData, options?: RequestOptions): Promise<CurlResponse> {
    return this.request({ ...options, url, method: "PATCH", data });
  }

  head(url: string, options?: RequestOptions): Promise<CurlResponse> {
    return this.request({ ...options, url, method: "HEAD" });
  }

  options(url: string, options?: RequestOptions): Promise<CurlResponse> {
    return this.request({ ...options, url, method: "OPTIONS" });
  }
}