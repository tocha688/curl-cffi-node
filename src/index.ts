import { globalInit, setLibPath } from "@tocha688/libcurl"
import { getLibPath } from "./app"

setLibPath(getLibPath())
globalInit(3);

export * from "@tocha688/libcurl";
export * from "./type";
export * from "./request";