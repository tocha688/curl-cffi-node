import { CurlMultiImpl, request, requestSync } from "../impl";
import { CurlResponse, FetchOptions, RequestOptions } from "../type";
import { CurlRequestBase } from "./request_base";

//同步方法
export class CurlClientSync extends CurlRequestBase {
    override async send(options: RequestOptions): Promise<CurlResponse> {
        return await requestSync(options);
    }
}

export class CurlClient extends CurlRequestBase { }

export async function fetch(url: string, options: FetchOptions = {}): Promise<CurlResponse> {
    options.url = url;
    options.data = options.body;
    if (options.sync) {
        return await requestSync(options);
    }
    return await request(options);
}




