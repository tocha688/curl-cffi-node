import { Curl, CurlInfo } from "@tocha688/libcurl";
import { CurlRequestInfo, RequestOptions } from "./request";
import { parseCurlCookies, getCookieUrl } from "../utils";
import { HttpHeaders } from "./header";
import { CookieJar } from "tough-cookie";

export type CurlResponseOptions = {
    headers: HttpHeaders;
    dataRaw?: Buffer;
    request: CurlRequestInfo;
    url: string;
    stacks?: Array<CurlRequestInfo>;
    options: RequestOptions;
    index?: number;
}

export class CurlResponse {
    url: string;
    statusCode: number;
    dataRaw?: Buffer;
    headers: HttpHeaders;
    request: CurlRequestInfo;
    options: RequestOptions;
    stacks: Array<CurlRequestInfo> = [];
    index: number = 0;
    redirects: number = 0;

    constructor(opts: CurlResponseOptions) {
        this.url = opts.url ?? opts.request?.url ?? '';
        this.request = opts.request;
        this.statusCode = opts.headers.status;
        this.dataRaw = opts.dataRaw;
        this.headers = opts.headers;
        this.stacks = opts.stacks || [];
        this.options = opts.options;
        this.index = opts.index ?? 0;
    }

    get text() {
        //获取响应header中的编码
        // const encoding: any = this.headers.first("charset") || this.headers.first("content-type")?.match(/charset=([^;]+)/)?.[1];
        return this.dataRaw?.toString("utf-8");
    }

    get data() {
        if (!this.text) return;
        try {
            return JSON.parse(this.text);
        } catch (e) {
            return this.text;
        }
    }


    get jar(): CookieJar | undefined {
        return this.request.jar;
    }

}