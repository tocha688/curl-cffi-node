import { globalCleanup } from "@tocha688/libcurl";
import { curlGlobalInit } from "../impl";
import { CurlRequest } from "./CurlRequest";
import { CurlRequestMulti } from "./CurlRequestMulti";

curlGlobalInit();
//@ts-ignore
// export const gimpl: CurlMultiImpl = global.gimpl = global.gimpl ?? new CurlMultiImpl();
export const storageCurls: Set<any> = global.__Tocha_CurlStorage = global.__Tocha_CurlStorage ?? new Set<any>();
// 避免在模块加载期实例化，改为惰性创建，防止循环依赖导致的初始化错误
let _req: CurlRequestMulti | undefined | CurlRequest;
export function getGlobalRequest(): CurlRequestMulti | CurlRequest {
    if (!_req) {
        _req = new CurlRequestMulti();
        storageCurls.add(_req);
    }
    return _req;
}

// 监听退出事件进行清理
let cleaned = false;
const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    try {
        // console.log("Cleaning up...");
        storageCurls.forEach(item => {
            try { item.close(); } catch { /* ignore */ }
        });
        globalCleanup();
    } catch {
        // ignore
    }
};

process.on("exit", cleanup);