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
    sync?: boolean;
    //开启curl日志
    dev?: boolean;
    //模拟浏览器跨域请求
    cors?: boolean;
    // curl?: Curl
}

// 实例化（客户端级别）配置，与单次请求的配置分离
// 不包含 url/method/params/data 等仅在请求时使用的字段
// 初始化配置：基于 RequestOptions 派生，移除仅请求时使用的字段
// 初始化配置：基于 RequestOptions 派生，移除仅请求时使用的字段
// 并新增 defaultParams/defaultData 作为客户端/会话级的默认值
export type RequestInitOptions = Omit<RequestOptions, "method" | "url" | "params" | "data"> & {
    baseUrl?: string;
    // 客户端/会话级默认查询参数（与每次请求的 options.params 合并，请求优先）
    params?: Record<string, any>;
    // 客户端/会话级默认请求体数据，会在每次请求时与 options.data 合并（请求优先）
    // 当两者均为对象时执行深合并；当为 URLSearchParams 时合并键值；否则以请求传入的值优先
    defaultData?: Record<string, any> | string | URLSearchParams | null;
};

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

export type RequestEvent = (options: RequestOptions) => Promise<RequestOptions>;
export type ResponseEvent = (options: CurlResponse) => Promise<CurlResponse>;

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

