import { CookieJar } from "tough-cookie";
import { HttpHeaders } from "./header";
import { CURL_IMPERSONATE } from "./const";
import { CurlHttpVersion, CurlMulti, CurlOpt } from "@tocha688/libcurl";
import { CurlResponse, defaultRequestOption } from ".";
import { CurlMultiEvent, CurlMultiTimer } from "../impl";

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
    method?: RequestMethod;
    url?: string;
    params?: Record<string, any>;
    data?: Record<string, any> | string;
    jar?: CookieJar;
    headers?: Record<string, string>;
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
    impl?: CurlMultiEvent | CurlMultiTimer;
    retryCount?: number;
    keepAlive?: boolean;
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

