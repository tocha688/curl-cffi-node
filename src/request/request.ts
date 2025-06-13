import { CurlMultiEvent, CurlMultiTimer, requestSync } from "../impl";
import { CurlResponse, RequestOptions } from "../type";
import { CurlRequestBase } from "./request_base";

//同步方法
export class CurlRequestSync extends CurlRequestBase {
    request(options: RequestOptions): Promise<CurlResponse> {
        return Promise.resolve(requestSync(options));
    }
}

//异步方法
export class CurlRequest extends CurlRequestBase {
    private multi = new CurlMultiEvent();
    async request(options: RequestOptions): Promise<CurlResponse> {
        return this.multi.request(options);
    }
    close(){
        this.multi.close();
    }
}

//异步方法
export class CurlRequestLoop extends CurlRequestBase {
    private multi = new CurlMultiTimer();
    async request(options: RequestOptions): Promise<CurlResponse> {
        return this.multi.request(options);
    }
    close(){
        this.multi.close()
    }
}