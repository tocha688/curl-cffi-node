import { curlGlobalInit, CurlMultiEvent } from "../impl";
import { CurlClient } from "./request";

curlGlobalInit();
//@ts-ignore
export const gimpl = global.gimpl = global.gimpl ?? new CurlMultiEvent();
export const req = new CurlClient({ impl: gimpl });

process.on("exit", () => {
    gimpl.close();
});