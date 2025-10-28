import { CookieJar } from "tough-cookie";
import { CurlResponse, RequestOptions } from "../type";
import { storageCurls } from "..";
import { CurlRequest } from "./CurlRequest";

/**
 * 会话客户端：在 baseOptions 中注入 CookieJar，并复用 CurlPool。
 */
export class CurlSession extends CurlRequest {
    constructor(ops?: RequestOptions) {
        super({
            ...ops,
            jar: ops?.jar ?? new CookieJar(),
        });
        storageCurls.add(this);
    }

    override close() {
        super.close();
        storageCurls.delete(this);
    }
}

