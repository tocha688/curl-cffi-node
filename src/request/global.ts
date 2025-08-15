import { globalCleanup } from "@tocha688/libcurl";
import { curlGlobalInit, CurlMultiImpl } from "../impl";
import { CurlClient } from "./client";

curlGlobalInit();
//@ts-ignore
// export const gimpl: CurlMultiImpl = global.gimpl = global.gimpl ?? new CurlMultiImpl();
export const storageCurls: Set<any> = global.__Tocha_CurlStorage = global.__Tocha_CurlStorage ?? new Set<any>();
export const req = new CurlClient();
storageCurls.add(req);

// 监听多个退出事件
const cleanup = () => {
    console.log("Cleaning up...");
    storageCurls.forEach(item => {
        item.close();
    })
    globalCleanup();
};

process.on("exit", cleanup);
// process.on("beforeExit", cleanup);
// process.on("SIGINT", cleanup);
// process.on("SIGTERM", cleanup);
// process.on("uncaughtException", cleanup);
// process.on("unhandledRejection", cleanup);