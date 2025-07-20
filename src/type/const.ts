
export type CURL_IMPERSONATE_EDGE = "edge99" | "edge101";
export type CURL_IMPERSONATE_CHROME = "chrome99" | "chrome100" | "chrome101" | "chrome104" | "chrome107" |
  "chrome110" | "chrome116" | "chrome119" | "chrome120" | "chrome123" | "chrome124" | "chrome131" | "chrome133a" |
  "chrome136" | "chrome99_android" | "chrome131_android";
export type CURL_IMPERSONATE_SAFARI = "safari153" | "safari155" | "safari170" | "safari172_ios" | "safari180" |
  "safari180_ios" | "safari184" | "safari184_ios" | "safari260" | "safari260_ios";
export type CURL_IMPERSONATE_FIREFOX = "firefox133" | "firefox135" | "tor145";
export type CURL_IMPERSONATE_DEFAULT = "chrome" | "firefox1" | "safar";

export type CURL_IMPERSONATE = CURL_IMPERSONATE_EDGE | CURL_IMPERSONATE_CHROME
  | CURL_IMPERSONATE_SAFARI | CURL_IMPERSONATE_FIREFOX | CURL_IMPERSONATE_DEFAULT;