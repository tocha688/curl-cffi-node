import { CookieJar } from "tough-cookie";
import { HttpHeaders } from "./header";
import { CURL_IMPERSONATE } from "./const";
import { Curl, CurlHttpVersion, CurlMulti, CurlOpt } from "@tocha688/libcurl";
import { CurlResponse, defaultRequestOption } from ".";
import { CurlMultiImpl } from "../impl";

export type RequestAuth = {
    username: string;
    password: string;
}

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS' | string;
export type RequestCert = {
    key: string;
    cert: string;
}
export type IpType = 'ipv4' | 'ipv6' | 'auto';
export type HttpVersion = "v1" | "v2" | "v3" | "v3only" | "v2tls" | "v2_prior_knowledge";

export type RequestOptions = {
    method?: RequestMethod;
    url?: string;
    params?: Record<string, any>;
    //请求数据
    data?: Record<string, any> | string | null;
    //cookie jar
    jar?: CookieJar;
    //请求头
    headers?: Record<string, string>;
    auth?: RequestAuth;
    timeout?: number;
    allowRedirects?: boolean;
    maxRedirects?: number;
    //代理 http://username:password@host:port
    proxy?: string;
    referer?: string;
    acceptEncoding?: string;
    //开启curl指纹
    impersonate?: CURL_IMPERSONATE;
    ja3?: string;
    akamai?: string;
    defaultHeaders?: boolean;
    defaultEncoding?: string;
    httpVersion?: HttpVersion | number;
    interface?: string;
    cert?: string | RequestCert;
    verify?: boolean;
    maxRecvSpeed?: number;
    curlOptions?: Record<CurlOpt, string | number | boolean>;
    ipType?: IpType;
    //开启multi，这将复用请求，默认不会复用
    impl?: CurlMultiImpl;
    //自动重试次数，默认0
    retryCount?: number;
    keepAlive?: boolean;
    //开启curl日志
    dev?: boolean;
    //模拟浏览器跨域请求
    cors?: boolean;
    curl?: Curl
}

export type FetchOptions = RequestOptions & {
    body?: string | Record<string, any> | null;
    //同步
    sync?: boolean;
}

export type CurlOptions = RequestOptions & {
    MaxConnects?: number;
    MaxConcurrentStreams?: number;
}

export type CurlRequestInfo = RequestOptions & {
    // request?: CurlRequest;
    response: CurlResponse;
}

export interface CurlRequestimpl {
    request(options: RequestOptions): Promise<CurlResponse>;
    get(url: string, params?: Record<string, any>, options?: RequestOptions): Promise<CurlResponse>;
    post(url: string, data?: Record<string, any>, options?: RequestOptions): Promise<CurlResponse>;
    put(url: string, data?: Record<string, any>, options?: RequestOptions): Promise<CurlResponse>;
    delete(url: string, data?: Record<string, any>, options?: RequestOptions): Promise<CurlResponse>;
    patch(url: string, data?: Record<string, any>, options?: RequestOptions): Promise<CurlResponse>;
    head(url: string, options?: RequestOptions): Promise<CurlResponse>;
    options(url: string, options?: RequestOptions): Promise<CurlResponse>;
}

