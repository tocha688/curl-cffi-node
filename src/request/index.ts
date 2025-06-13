import { curlGlobalInit } from "../impl";
import { CurlClient } from "./request";

export * from "./request";
export * from "./session";

curlGlobalInit();
export const req = new CurlClient();

