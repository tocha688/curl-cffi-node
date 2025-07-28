import { Curl } from "@tocha688/libcurl";
import { CurlMultiImpl, request, requestSync } from "../impl";
import { CurlResponse, FetchOptions, RequestOptions } from "../type";
import { setRequestOptions } from "../helper";


export async function fetch(url: string, options: FetchOptions = {}): Promise<CurlResponse> {
    options.url = url;
    options.data = options.body;
    let curl = new Curl();
    setRequestOptions(curl, options);
    if (options.sync) {
        return await requestSync(options, curl);
    }
    return await request(options, curl);
}




