import { CookieJar } from "tough-cookie";
import { CurlResponse, RequestOptions } from "../type";
import { CurlClient, CurlClientSync } from "./request";


//同步方法
export class CurlSessionSync extends CurlClientSync {
    constructor(ops?: RequestOptions) {
        super({
            ...ops,
            jar: ops?.jar ?? new CookieJar()
        });
    }
}

//异步方法
export class CurlSession extends CurlClient {
    constructor(ops?: RequestOptions) {
        super({
            ...ops,
            jar: ops?.jar ?? new CookieJar(),
        });
    }
}
