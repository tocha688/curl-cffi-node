
import { RequestOptions } from "./request";

export const defaultRequestOption: Partial<RequestOptions> = {
    method: 'GET',
    timeout: 30000,
    allowRedirects: true,
    maxRedirects: 5,
    verify: true,
    acceptEncoding: 'gzip, deflate, br',
    impersonate: "chrome136",
    // maxRecvSpeed: 0,
    ipType: "auto",
    defaultHeaders: true,
};

export * from "./request";
export * from "./header";
export * from "./response";
export * from "./const";




