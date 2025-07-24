import qs from "querystring";
import { Cookie, CookieJar } from "tough-cookie";
import { HttpHeaders, HttpVersion } from "./type";
import { CurlHttpVersion } from "@tocha688/libcurl";

export function buildUrl(baseUrl: string, params?: Record<string, any>): string {
    if (!params) return baseUrl;
    const url = new URL(baseUrl);
    qs.stringify(params).split('&').forEach(param => {
        const [key, value] = param.split('=');
        url.searchParams.set(key, value);
    })
    return url.toString();
}

export function parseCurlCookies(cookieStringArray: string[]): Array<Cookie> {
    return cookieStringArray.map(line => {
        const parts = line.split(/\s+/);
        return new Cookie({
            key: parts[5], // Cookie 名称
            value: parts.slice(6).join(" "), // Cookie 值（可能包含空格）
            domain: parts[0].replace("#HttpOnly_", ""), // 处理 HttpOnly 前缀
            path: parts[2],
            secure: parts[3] === "TRUE",
            httpOnly: line.startsWith("#HttpOnly"),
            expires: new Date(parseInt(parts[4]) * 1000),
        })
    });
}

export function getCookieUrl(url: string, co: Cookie) {
    const u = new URL(url);
    if (!co.domain || u.hostname.endsWith(co.domain)) {
        return url;
    }
    return u.protocol + '//' + co.domain.substring(1);
}

export function parseResponseHeaders(str: string) {
    const headers = [] as Array<HttpHeaders>
    let ch = new HttpHeaders();
    for (const line of str.split('\r\n')) {
        if (!line) continue;
        if (line.startsWith('HTTP/')) {
            ch = new HttpHeaders();
            ch.head = line.trim();
            headers.push(ch);
            continue;
        }
        if (line.includes(":")) {
            const [key, ...vals] = line.split(":");
            ch.set(key, vals.join(":").trim());
        }
    }
    return headers;
}

export async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export type IntervalResult = {
    isrun: boolean,
    isunref: boolean,
    id: any,
    unref: () => void
}
export function setInterval(callback: Function, interval: number): IntervalResult {
    const info: IntervalResult = {
        isrun: true,
        isunref: false,
        unref: () => {
            info.isunref = true;
            info.id?.unref();
        },
        id: undefined
    }
    const timerCall = async () => {
        if (info.isrun !== true) return;
        await callback();
        info.id = setTimeout(timerCall, interval);
        if (info.isunref) info.id?.unref();
    }
    info.id = setTimeout(timerCall, interval);
    return info;
}

export function clearInterval(info: IntervalResult) {
    if (!info) return;
    info.isrun = false;
    info.id && clearTimeout(info.id);
}

export function normalize_http_version(
    version: HttpVersion|number
):number{
    if (typeof version === 'number') {
        return version;
    }else if (version === "v1") {
        return CurlHttpVersion.V1_1;
    }else if (version === "v2") {
        return CurlHttpVersion.V2_0;
    }else if (version === "v3") {
        return CurlHttpVersion.V3;
    }else if (version === "v3only") {
        return CurlHttpVersion.V3Only;
    }else if (version === "v2tls") {
        return CurlHttpVersion.V2Tls;
    }else if (version === "v2_prior_knowledge") {
        return CurlHttpVersion.V2PriorKnowledge;
    }
    return version;
}
    