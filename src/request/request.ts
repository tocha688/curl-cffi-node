import { CurlMultiEvent, CurlMultiTimer, requestSync } from "../impl";
import { CurlResponse, RequestOptions } from "../type";
import { CurlRequestBase } from "./request_base";



//同步方法
export class CurlClientSync extends CurlRequestBase { }

//异步方法
export class CurlClient extends CurlRequestBase {
    constructor(ops?: RequestOptions) {
        const impl = ops?.impl ?? (global as any)?.gimpl ?? new CurlMultiEvent();
        super({
            ...ops,
            impl
        });
    }
}

//异步方法
export class CurlClientLoop extends CurlRequestBase {
    constructor(ops?: RequestOptions) {
        const impl = ops?.impl ?? new CurlMultiTimer();
        super({
            ...ops,
            impl
        });
    }
}



