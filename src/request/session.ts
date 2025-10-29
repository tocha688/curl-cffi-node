import { CookieJar } from "tough-cookie";
import { CurlResponse, RequestOptions, RequestInitOptions } from "../type";
import { storageCurls } from "./global";
import { CurlRequest } from "./CurlRequest";
import { CurlPoolOptions } from "../core/CurlPool";

/**
 * 会话客户端：在 baseOptions 中注入 CookieJar，并复用 CurlPool。
 */
export class CurlSession extends CurlRequest {
    constructor(ops?: RequestInitOptions, poolOptions?: CurlPoolOptions) {
        super({
            ...ops,
            jar: ops?.jar ?? new CookieJar(),
        }, poolOptions);
    }
}

