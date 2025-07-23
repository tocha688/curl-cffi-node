import { getLibPath as getLibPathBase, getVersion } from "@tocha688/libcurl"
export { CurlMOpt, CurlHttpVersion, CurlOpt, CurlError, CurlInfo, CurlIpResolve, CurlSslVersion, CurlWsFlag, } from "@tocha688/libcurl";
export * from "./type";
export * from "./request";
export * from "./logger";
export const libVersion = () => getVersion();
export const libPath = () => getLibPathBase();


