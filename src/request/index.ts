import { curlGlobalInit } from "../impl";
import { CurlRequest } from "./request";

export * from "./request";
export * from "./session";

curlGlobalInit();
export const req = new CurlRequest();

