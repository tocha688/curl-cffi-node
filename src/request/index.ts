import { getGlobalRequest } from "./global";

export * from "./request";
export * from "./session";
// 不在导出全局变量
export * from "./global";
export { BaseClient } from "./BaseClient";
export { RequestClientBase } from "./RequestClientBase";
export { CurlRequest } from "./CurlRequest";
export { CurlRequestMulti } from "./CurlRequestMulti";
// 保留旧接口以兼容现有代码
export { CurlClient } from "./client";
export const req = getGlobalRequest();

