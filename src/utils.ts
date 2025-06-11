import qs from "querystring";
import { Cookie, CookieJar } from "tough-cookie";
import { HttpHeaders } from "./type";
import { Curl } from "@tocha688/libcurl";

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

