import { Curl, CurlInfo, CurlOpt, CurlSslVersion } from "@tocha688/libcurl";
import { RequestOptions, HttpHeaders, CurlResponse, CurlRequestInfo, defaultRequestOption } from "./type";
import { certPath } from "./app";
import { buildUrl, normalize_http_version, parseResponseHeaders } from "./utils";
import _ from "lodash";


export function setRequestOptions(curl: Curl, opts: RequestOptions, isCors = false) {
    //合并
    opts = { ...defaultRequestOption, ...opts };
    const currentUrl = buildUrl(opts.url as string, opts.params);
    const method = opts.method?.toLocaleUpperCase() || 'GET';
    if (method == "POST") {
        curl.setOptLong(CurlOpt.Post, 1);
    } else if (method !== "GET") {
        curl.setOptString(CurlOpt.CustomRequest, method)
    }
    if (method == "HEAD") {
        curl.setOptLong(CurlOpt.Nobody, 1);
    }
    //url
    curl.setOptString(CurlOpt.Url, currentUrl);
    //data/body/json
    let body: any = opts.data;
    //headers
    const headers = new HttpHeaders(opts.headers);
    let contentType = headers.first('Content-Type');
    if (opts.data && typeof opts.data === 'object') {
        if (opts.data instanceof URLSearchParams) {
            body = opts.data.toString()
            contentType = 'application/x-www-form-urlencoded';
        } else if (Buffer.isBuffer(opts.data)) {
            body = opts.data;
            contentType = 'application/octet-stream';
        } else {
            body = JSON.stringify(opts.data)
            contentType = 'application/json';
        }
    } else if (typeof opts.data === 'string') {
        body = opts.data;
    } else {
        body = ""
    }
    if (body || ["POST", "PUT", "PATCH"].includes(method)) {
        curl.setBodyString(body);
        if (method == "GET") {
            curl.setOptString(CurlOpt.CustomRequest, method);
        }
    }
    if (contentType) {
        headers.set('Content-Type', contentType);
    }
    // # Never send `Expect` header.
    headers.delete("Expect")
    // curl.setOptList(CurlOpt.HttpHeader, headers.toArray());
    curl.setHeadersRaw(headers.toArray());
    //cookie
    curl.setOptString(CurlOpt.CookieFile, "");
    curl.setOptString(CurlOpt.CookieList, 'ALL');
    const cookieHeader = headers.first("cookie");
    if (cookieHeader || opts.jar) {
        const cookies = new Map<string, string>();
        if (cookieHeader) {
            //如果有cookie头，则不使用jar
            if (cookieHeader) {
                cookieHeader.split(';').forEach(cookie => {
                    if (!cookie?.trim()) return;
                    const [key, value] = cookie.split('=');
                    cookies.set(key.trim(), (value ?? "").trim());
                });
            }
        }
        if (opts.jar) {
            const cookieJar = opts.jar;
            const jarCookies = cookieJar.getCookiesSync(currentUrl);
            if (jarCookies.length > 0) {
                jarCookies.forEach(cookie => {
                    cookies.set(cookie.key, cookie.value);
                })
            }
        }
        if (cookies.size > 0) {
            const cookieStr = Array.from(cookies.entries()).map(([key, value]) => `${key}=${value}`).join('; ')
            curl.setCookies(cookieStr)
        }
    }

    //auth
    if (opts.auth) {
        const { username, password } = opts.auth;
        curl.setOptString(CurlOpt.Username, username);
        curl.setOptString(CurlOpt.Password, password);
    }
    opts.timeout = opts.timeout ?? 0;
    //timeout
    if (opts.timeout && opts.timeout > 0) {
        //不是流传输
        curl.setOptLong(CurlOpt.TimeoutMs, opts.timeout);
        //     if not stream:
        //     c.setopt(CurlOpt.TIMEOUT_MS, int(timeout * 1000))
        // else:
        //     c.setopt(CurlOpt.CONNECTTIMEOUT_MS, int(timeout * 1000))
        //     c.setopt(CurlOpt.LOW_SPEED_LIMIT, 1)
        //     c.setopt(CurlOpt.LOW_SPEED_TIME, math.ceil(timeout))
    }
    // allow_redirects
    curl.setOptBool(CurlOpt.FollowLocation, opts.allowRedirects ?? true);
    curl.setOptLong(CurlOpt.MaxRedirs, opts.maxRedirects ?? 30);

    //代理
    if (opts.proxy) {
        const proxy = new URL(opts.proxy);
        curl.setOptString(CurlOpt.Proxy, proxy.protocol + '//' + proxy.host);
        if (!proxy.protocol.startsWith('socks')) {
            curl.setOptBool(CurlOpt.HttpProxyTunnel, true);
        }
        if (proxy.username && proxy.password) {
            curl.setOptString(CurlOpt.ProxyUsername, proxy.username);
            curl.setOptString(CurlOpt.ProxyPassword, proxy.password);
        }
    }
    // 显式禁用SSL验证
    if (opts.verify === false) {
        curl.setOptLong(CurlOpt.SslVerifyPeer, 0);
        curl.setOptLong(CurlOpt.SslVerifyHost, 0);
    } else {
        curl.setOptLong(CurlOpt.SslVerifyPeer, 1);
        curl.setOptLong(CurlOpt.SslVerifyHost, 2);
        //设置证书
        curl.setOptString(CurlOpt.CaInfo, certPath);
        curl.setOptString(CurlOpt.ProxyCaInfo, certPath);
    }

    //指纹
    if (opts.impersonate) {
        curl.impersonate(opts.impersonate, opts.defaultHeaders ?? true);
    }

    // referer
    if (opts.referer) {
        curl.setOptString(CurlOpt.Referer, opts.referer);
    }
    // accept_encoding
    if (opts.acceptEncoding) {
        curl.setOptString(CurlOpt.AcceptEncoding, opts.acceptEncoding);
    }

    //单独证书
    if (typeof opts.cert === 'string') {
        curl.setOptString(CurlOpt.SslCert, opts.cert);
    } else if (!!opts.cert) {
        !!opts.cert?.cert && curl.setOptString(CurlOpt.SslCert, opts.cert.cert);
        !!opts.cert?.key && curl.setOptString(CurlOpt.SslKey, opts.cert.key);
    }

    // 只有在没有指纹时才设置 HTTP 版本
    if (!opts.impersonate && !opts.httpVersion) {
        curl.setOptLong(CurlOpt.HttpVersion, normalize_http_version('v2'));
    } else if (!opts.impersonate && opts.httpVersion) {
        curl.setOptLong(CurlOpt.HttpVersion, normalize_http_version(opts.httpVersion));
    }

    // 删除这段重复设置的代码
    // if (!opts.httpVersion) {
    //     curl.setOptLong(CurlOpt.HttpVersion, normalize_http_version('v2'));
    // } else {
    //     curl.setOptLong(CurlOpt.HttpVersion, normalize_http_version(opts.httpVersion));
    // }

    // 删除重复的 interface 设置
    if (opts.interface) {
        curl.setOptString(CurlOpt.Interface, opts.interface);
    }

    //ipType
    if (opts.ipType) {
        switch (opts.ipType) {
            case 'ipv4':
                curl.setOptLong(CurlOpt.IpResolve, 1);
                break;
            case 'ipv6':
                curl.setOptLong(CurlOpt.IpResolve, 2);
                break;
            case 'auto':
                curl.setOptLong(CurlOpt.IpResolve, 0);
                break;
        }
    }

    //添加keepalive
    if (opts.keepAlive === false && isCors === false) {
        curl.setOptLong(CurlOpt.TcpKeepAlive, 0);
        //使用新连接
        curl.setOptLong(CurlOpt.FreshConnect, 1);
    }

    if (opts.dev) {
        curl.setOptLong(CurlOpt.Verbose, 1);
        // curl.setOptLong(CurlOpt.Header, 1);
        // curl.setOptLong(CurlOpt.NoProgress, 0);
    }
    // since 0 is a valid value to disable it
    curl.setOptLong(CurlOpt.MaxRecvSpeedLarge, opts.maxRecvSpeed ?? 0);
    //参数
    if (opts.curlOptions) {
        if (!!opts?.curlOptions) {
            for (const [key, value] of Object.entries(opts.curlOptions)) {
                let ekey = key as unknown as CurlOpt;
                if (typeof value === 'string') {
                    curl.setOptString(ekey, value);
                } else if (typeof value === 'number') {
                    curl.setOptLong(ekey, value);
                } else if (typeof value === 'boolean') {
                    curl.setOptBool(ekey, value);
                }
            }
        }
    }

}


export function parseResponse(curl: Curl, req: RequestOptions) {
    // const url = curl.getInfoString(CurlInfo.EffectiveUrl) || req.url;
    // const status = curl.getInfoNumber(CurlInfo.ResponseCode);
    const dataRaw = curl.getRespBody();
    const headerRaw = curl.getRespHeaders().toString('utf-8');
    //堆栈
    const stacks = [] as Array<CurlRequestInfo>
    const hds = parseResponseHeaders(headerRaw)
    const jar = req.jar;
    let nextReq = _.clone(req) as CurlRequestInfo;
    hds.forEach((header, i) => {
        const treq = _.clone(nextReq) as CurlRequestInfo;
        //构建响应体
        const res = new CurlResponse({
            url: treq.url as string,
            headers: header,
            request: treq,
            options: req,
            stacks,
            index: stacks.length,
            curl
        })
        res.redirects = Math.max(0, stacks.length - 1);
        treq.response = res;
        let loction = res.headers.first('location')
        if (loction) {
            nextReq.url = new URL(loction, treq.url).toString();
            nextReq.method = 'GET';
            nextReq.data = undefined;
        } else {
            res.dataRaw = dataRaw;
        }
        //jar
        if (jar) {
            res.headers.get('set-cookie')?.forEach(cookie => {
                jar.setCookieSync(cookie, treq.url as string);
            })
        }
        stacks.push(treq)
    })
    return stacks[Math.max(stacks.length - 1, 0)].response as CurlResponse;
}

