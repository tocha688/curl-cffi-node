import { getLibPath as getLibPathBase, getVersion } from "@tocha688/libcurl"
export * from "@tocha688/libcurl";
export * from "./type";
export * from "./request";
export * from "./logger";
export const getLibVersion = () => getVersion();
export const getLibPath = () => getLibPathBase();


