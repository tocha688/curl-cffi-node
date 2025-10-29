import { globalCleanup } from "@tocha688/libcurl";
import { curlGlobalInit } from "../impl";
import { CurlRequest } from "./CurlRequest";

curlGlobalInit();
//@ts-ignore
// export const gimpl: CurlMultiImpl = global.gimpl = global.gimpl ?? new CurlMultiImpl();
export const storageCurls: Set<any> = global.__Tocha_CurlStorage = global.__Tocha_CurlStorage ?? new Set<any>();
export const req = new CurlRequest();
storageCurls.add(req);

// 监听多个退出事件（避免在 'exit' 事件中做清理，部分平台可能阻塞退出）
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

process.on("beforeExit", cleanup);
process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
process.on("uncaughtException", cleanup);
process.on("unhandledRejection", cleanup);