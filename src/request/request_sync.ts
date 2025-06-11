import { Curl } from "@tocha688/libcurl";
import { parseResponse, setRequestOptions } from "../helper";
import { CurlResponse, defaultRequestOption, RequestOptions } from "../type";

export function requestSync(options: RequestOptions): CurlResponse {
    const curl = new Curl();
    //合并默认
    options = {
        ...defaultRequestOption,
        ...options
    }
    setRequestOptions(curl, options);
    curl.perform();
    const response = parseResponse(curl, options);
    curl.close();
    return response;
}