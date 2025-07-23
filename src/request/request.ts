import { CurlMultiImpl, requestSync } from "../impl";
import { CurlResponse, RequestOptions } from "../type";
import { CurlRequestBase } from "./request_base";

//同步方法
export class CurlClientSync extends CurlRequestBase { }

//异步方法
export class CurlClient extends CurlRequestBase {
    constructor(ops?: RequestOptions) {
        let impl: CurlMultiImpl = ops?.impl ?? (global as any)?.gimpl ?? new CurlMultiImpl();
        if (impl.closed) {
            impl = new CurlMultiImpl();
        }
        super({
            ...ops,
            impl
        });
    }
}





