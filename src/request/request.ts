import { CurlMultiEvent, CurlMultiTimer, requestSync } from "../impl";
import { CurlResponse, RequestOptions } from "../type";
import { gimpl } from "./global";
import { CurlRequestBase } from "./request_base";



//同步方法
export class CurlClientSync extends CurlRequestBase { }

//异步方法
export class CurlClient extends CurlRequestBase {
    constructor(ops?: RequestOptions) {
        const impl = ops?.impl ?? gimpl;
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



