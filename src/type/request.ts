import { CookieJar } from "tough-cookie";
import { HttpHeaders } from "./header";
import { CURL_IMPERSONATE } from "./const";
import { CurlHttpVersion, CurlOpt } from "@tocha688/libcurl";
import { CurlResponse, defaultRequestOption } from ".";

export type RequestAuth = {
    username: string;
    password: string;
}

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS' | string;
export type HttpVersion = CurlHttpVersion;
export type RequestCert = {
    key: string;
    cert: string;
}
export type IpType = 'ipv4' | 'ipv6' | 'auto';

export type RequestOptions = {
    method: RequestMethod;
    url: string;
    params?: Record<string, any>;
    data?: Record<string, any> | string;
    jar?: CookieJar;
    headers?: Record<string, string> | HttpHeaders;
    auth?: RequestAuth;
    timeout?: number;
    allowRedirects?: boolean;
    maxRedirects?: number;
    proxy?: string;
    referer?: string;
    acceptEncoding?: string;
    impersonate?: CURL_IMPERSONATE;
    ja3?: string;
    akamai?: string;
    defaultHeaders?: boolean;
    defaultEncoding?: string;
    httpVersion?: HttpVersion;
    interface?: string;
    cert?: string | RequestCert;
    verify?: boolean;
    maxRecvSpeed?: number;
    curlOptions?: Record<CurlOpt, string | number | boolean>;
    ipType?: IpType;
}

export type CurlRequest = RequestOptions & {
    // request?: CurlRequest;
    response: CurlResponse;
}

// export class CurlRequest {
//     method: RequestMethod;
//     url: string;
//     params?: Record<string, any>;
//     data?: Record<string, any> | string;
//     jar?: CookieJar;
//     headers?: Record<string, string> | HttpHeaders;
//     auth?: RequestAuth;
//     timeout?: number;
//     allowRedirects?: boolean;
//     maxRedirects?: number;
//     proxy?: string;
//     referer?: string;
//     acceptEncoding?: string;
//     impersonate?: CURL_IMPERSONATE;
//     ja3?: string;
//     akamai?: string;
//     defaultHeaders?: boolean;
//     defaultEncoding?: string;
//     httpVersion?: HttpVersion;
//     interface?: string;
//     cert?: string | RequestCert;
//     verify?: boolean;
//     maxRecvSpeed?: number;
//     curlOptions?: Record<CurlOpt, string | number | boolean>;
//     ipType?: IpType;
//     constructor(opts: RequestOptions, beforeResHeaders?: HttpHeaders) {
//         const dopt = defaultRequestOption;
//         this.method = opts.method ?? dopt?.method ?? 'GET';
//         this.url = opts.url;
//         this.params = opts.params ?? {};
//         this.data = opts.data;
//         this.jar = opts.jar ?? dopt?.jar;
//         this.headers = new HttpHeaders({
//             ...dopt?.headers,
//             ...opts.headers
//         } as Record<string, string>);
//         this.auth = opts.auth;
//         this.timeout = opts.timeout ?? opts?.timeout ?? 30000; // 默认30秒
//         this.allowRedirects = opts.allowRedirects ?? opts?.allowRedirects ?? true;
//         this.maxRedirects = opts.maxRedirects ?? opts.maxRedirects ?? 5;
//         this.proxy = opts.proxy ?? opts.proxy;
//         this.referer = opts.referer ?? opts.referer;
//         this.acceptEncoding = opts.acceptEncoding ?? opts.acceptEncoding ?? 'gzip, deflate, br';
//         this.impersonate = opts.impersonate ?? opts.impersonate ?? 'chrome';
//         this.ja3 = opts.ja3 ?? opts.ja3;
//         this.akamai = opts.akamai ?? opts.akamai;
//         this.defaultHeaders = opts.defaultHeaders ?? opts.defaultHeaders ?? true;
//         this.defaultEncoding = opts.defaultEncoding ?? opts.defaultEncoding ?? 'utf-8';
//         this.httpVersion = opts.httpVersion ?? opts.httpVersion;
//         this.interface = opts.interface ?? opts.interface;
//         this.cert = opts.cert ?? opts.cert;
//         this.verify = opts.verify ?? opts.verify ?? true;
//         this.maxRecvSpeed = opts.maxRecvSpeed ?? opts.maxRecvSpeed ?? 0;
//         this.curlOptions = opts.curlOptions ?? opts.curlOptions;
//         this.ipType = opts.ipType ?? opts.ipType ?? 'auto';
//         if (beforeResHeaders) {
//             let url = beforeResHeaders.first("location");
//         }
//     }
// }