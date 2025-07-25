import { Curl } from "@tocha688/libcurl";
import { parseResponse, setRequestOptions } from "../helper";
import { CurlResponse, defaultRequestOption, RequestOptions } from "../type";

export function requestSync(options: RequestOptions): CurlResponse {
    const curl = options.curl ?? new Curl();
    try {
        //合并默认
        options = {
            ...defaultRequestOption,
            ...options
        }
        if (options.curl) options.curl.reset();
        setRequestOptions(curl, options);
        curl.performSync();
        return parseResponse(curl, options);
    } finally {
        curl.close();
    }
}

export async function request(options: RequestOptions): Promise<CurlResponse> {
    const curl = options.curl ?? new Curl();
    try {
        //合并默认
        options = {
            ...defaultRequestOption,
            ...options
        }
        if (options.curl) options.curl.reset();
        setRequestOptions(curl, options);
        await curl.perform();
        return parseResponse(curl, options);
    } finally {
        curl.close();
    }
}
