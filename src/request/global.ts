import { curlGlobalInit, CurlMultiEvent } from "../impl";
import { CurlClient } from "./request";

curlGlobalInit();
//@ts-ignore
export const gimpl: CurlMultiEvent = global.gimpl = global.gimpl ?? new CurlMultiEvent();
export const req = new CurlClient({ impl: gimpl });

// 监听多个退出事件
const cleanup = () => {
    gimpl.close();
};

process.on("exit", cleanup);
process.on("beforeExit", cleanup);
process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
process.on("uncaughtException", cleanup);
process.on("unhandledRejection", cleanup);