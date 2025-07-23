import { Curl, CurlInfo, CurlOpt, CurlSslVersion } from "@tocha688/libcurl";
import { RequestOptions, HttpHeaders, CurlResponse, CurlRequestInfo } from "./type";
import { certPath } from "./app";
import { buildUrl, parseResponseHeaders } from "./utils";
import _ from "lodash";


export function setRequestOptions(curl: Curl, opts: RequestOptions) {
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
    let body: any = "";
    //headers
    const headers = new HttpHeaders(opts.headers);

    let contentType = headers.first('Content-Type');
    if (opts.data && typeof opts.data === 'object') {
        if (body instanceof URLSearchParams) {
            body = opts.data.toString()
            contentType = 'application/x-www-form-urlencoded';
        } else {
            body = JSON.stringify(opts.data)
            contentType = 'application/json';
        }
    } else if (typeof opts.data === 'string') {
        body = opts.data;
    }
    if (body || ["POST", "PUT", "PATCH"].includes(method)) {
        const data = Buffer.from(body)
        curl.setOptBuffer(CurlOpt.PostFields, data);
        curl.setOptLong(CurlOpt.PostFieldSize, data.length);
        if (method == "GET") {
            curl.setOptString(CurlOpt.CustomRequest, method);
        }
    }

    if (contentType) {
        headers.set('Content-Type', contentType);
    }
    curl.setHeaders(headers.toObject());
    //cookie
    curl.setOptString(CurlOpt.CookieFile, '');
    curl.setOptString(CurlOpt.CookieList, 'ALL');
    const cookies: string[] = [];
    const cookieHeader = headers.first("cookie");
    if (cookieHeader) {
        //如果有cookie头，则不使用jar
        if (cookieHeader) {
            cookieHeader.split(';').forEach(cookie => {
                cookies.push(cookie.trim());
            });
        }
    }
    if (opts.jar) {
        const cookieJar = opts.jar;
        const jarCookies = cookieJar.getCookiesSync(currentUrl);
        if (jarCookies.length > 0) {
            jarCookies.forEach(cookie => cookies.push(`${cookie.key}=${cookie.value}`))
        }
    }
    if (cookies.length > 0) {
        curl.setCookies(cookies.join('; '));
    }

    //auth
    if (opts.auth) {
        const { username, password } = opts.auth;
        curl.setOptString(CurlOpt.Username, username);
        curl.setOptString(CurlOpt.Password, password);
    }
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
    //keep-alive
    if (opts.keepAlive === false) {
        //防止重用连接
        curl.setOptBool(CurlOpt.ForbidReuse, true);
        //使用新连接
        curl.setOptBool(CurlOpt.FreshConnect, true);
    } else {
        curl.setOptBool(CurlOpt.ForbidReuse, false);
        curl.setOptBool(CurlOpt.FreshConnect, false);
    }
    curl.setOptLong(CurlOpt.TcpKeepAlive, 60);
    curl.setOptLong(CurlOpt.TcpKeepIdle, 120);
    curl.setOptLong(CurlOpt.TcpKeepIntvl, 60);
    curl.setOptLong(CurlOpt.SslSessionIdCache, 1);
    // curl.setOptLong(CurlOpt.TcpFastOpen, 1);

    //缓存dns 10分钟
    curl.setOptLong(CurlOpt.DnsCacheTimeout, 600);
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
        curl.setOptString(CurlOpt.CaInfo, certPath);
        curl.setOptString(CurlOpt.ProxyCaInfo, certPath);
        // curl.setOptLong(CurlOpt.SslVersion, CurlSslVersion.MaxDefault);
    }
    //单独证书
    if (typeof opts.cert === 'string') {
        curl.setOptString(CurlOpt.SslCert, opts.cert);
    } else if (!!opts.cert) {
        !!opts.cert?.cert && curl.setOptString(CurlOpt.SslCert, opts.cert.cert);
        !!opts.cert?.key && curl.setOptString(CurlOpt.SslKey, opts.cert.key);
    }
    if (opts.referer) {
        curl.setOptString(CurlOpt.Referer, opts.referer);
    }
    if (opts.acceptEncoding) {
        curl.setOptString(CurlOpt.AcceptEncoding, opts.acceptEncoding);
    } else {
        curl.setOptString(CurlOpt.AcceptEncoding, '');
    }

    curl.setOptBool(CurlOpt.FollowLocation, opts.allowRedirects ?? true);
    if (opts.allowRedirects !== false) {
        curl.setOptLong(CurlOpt.MaxRedirs, opts.maxRedirects ?? 5);
    }

    //指纹
    if (opts.impersonate) {
        curl.impersonate(opts.impersonate, opts.defaultHeaders ?? true);
    }
    // extra_fp
    // ja3 string
    // akamai string
    // ...
    // http_version, after impersonate, which will change this to http2
    if (opts.httpVersion) {
        curl.setOptLong(CurlOpt.HttpVersion, opts.httpVersion);
    }
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

