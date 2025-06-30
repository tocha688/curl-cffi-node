import { globalInit, setLibPath } from '@tocha688/libcurl';
import { getLibPath } from '../app';


export * from './request_sync';
export * from './curl_multi_event';
export * from './curl_multi_timer';

export function curlGlobalInit() {
    setLibPath(getLibPath())
    globalInit(3);
}
