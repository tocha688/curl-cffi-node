import { globalInit, setLibPath } from '@tocha688/libcurl';
import { getLibPath } from '../app';
import { CurlMultiTimer } from './curl_multi_timer';
import { CurlMultiEvent } from './curl_multi_event';

export * from './request_sync';
// export * from './curl_multi_event';
export class CurlMultiImpl extends CurlMultiTimer { }

export function curlGlobalInit() {
    setLibPath(getLibPath())
    globalInit(1);
}
