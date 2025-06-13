import { curlGlobalInit, CurlMultiEvent } from "../impl";
import { CurlClient } from "./request";

curlGlobalInit();
export const gimpl = new CurlMultiEvent();
export const req = new CurlClient({ impl: gimpl });

process.on("exit", () => {
    gimpl.close();
});