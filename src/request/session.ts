import { CookieJar } from "tough-cookie";
import { CurlMultiEvent, CurlMultiTimer, requestSync } from "../impl";
import { CurlResponse, RequestOptions } from "../type";
import { CurlRequestBase } from "./request_base";
import { CurlClient, CurlClientLoop, CurlClientSync } from "./request";


//同步方法
export class CurlSesionSync extends CurlClientSync {
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

//异步方法
export class CurlSessionLoop extends CurlClientLoop {
    constructor(ops?: RequestOptions) {
        super({
            ...ops,
            jar: ops?.jar ?? new CookieJar(),
        });
    }
}

