import { CookieJar } from "tough-cookie";
import { CurlMultiEvent, CurlMultiTimer, requestSync } from "../impl";
import { CurlResponse, RequestOptions } from "../type";
import { CurlRequestBase } from "./request_base";


//同步方法
export class SesionSync extends CurlRequestBase {
    jar = new CookieJar();
    protected request(options: RequestOptions): Promise<CurlResponse> {
        return Promise.resolve(requestSync({
            jar: this.jar,
            ...options
        }));
    }
}

//异步方法
export class Session extends CurlRequestBase {
    jar = new CookieJar();
    private multi = new CurlMultiEvent();
    protected async request(options: RequestOptions): Promise<CurlResponse> {
        return this.multi.request({
            jar: this.jar,
            ...options
        });
    }
    close() {
        this.multi.close();
    }
}

//异步方法
export class SessionLoop extends CurlRequestBase {
    jar = new CookieJar();
    private multi = new CurlMultiTimer();
    protected async request(options: RequestOptions): Promise<CurlResponse> {
        return this.multi.request({
            jar: this.jar,
            ...options
        });
    }
    close() {
        this.multi.close()
    }
}