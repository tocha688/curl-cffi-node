import { Curl } from "@tocha688/libcurl";
import { parseResponse, setRequestOptions } from "../helper";
import { CurlResponse, defaultRequestOption, RequestOptions } from "../type";

export function requestSync(options: RequestOptions): CurlResponse {
    const curl = new Curl();
    try {
        //合并默认
        options = {
            ...defaultRequestOption,
            ...options
        }
        setRequestOptions(curl, options);
        curl.perform();
        return parseResponse(curl, options);
    } finally {
        curl.close();
    }
}