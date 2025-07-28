import { Curl } from "@tocha688/libcurl";
import { parseResponse, setRequestOptions } from "../helper";
import { CurlResponse, defaultRequestOption, RequestOptions } from "../type";

export function requestSync(options: RequestOptions, curl: Curl): CurlResponse {
    try {
        curl.performSync();
        return parseResponse(curl, options);
    } finally {
        // curl.close();
    }
}

export async function request(options: RequestOptions, curl: Curl): Promise<CurlResponse> {
    try {
        await curl.perform();
        return parseResponse(curl, options);
    } finally {
        // curl.close();
    }
}
