
import { RequestOptions, RequestInitOptions } from "./request";
import _ from "lodash";

export const defaultRequestOption: Partial<RequestOptions> = {
    method: 'GET',
    timeout: 30000,
    allowRedirects: true,
    maxRedirects: 5,
    verify: true,
    acceptEncoding: 'gzip, deflate, br, zstd',
    // impersonate: "chrome136",
    // maxRecvSpeed: 0,
    ipType: "auto",
    defaultHeaders: true,
    maxRecvSpeed: 0,
};

// 客户端默认配置（用于实例化 CurlRequest），不包含 url/method 等仅请求时使用的字段
export const defaultInitOptions: Partial<RequestInitOptions> = _.omit(defaultRequestOption, ["method", "url", "params", "data"]) as Partial<RequestInitOptions>;

export * from "./request";
export * from "./header";
export * from "./response";
export * from "./const";




