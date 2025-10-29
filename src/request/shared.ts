import _ from "lodash";
import { Curl } from "@tocha688/libcurl";
import { setRequestOptions } from "../helper";
import { CurlResponse, RequestInitOptions, RequestOptions } from "../type";

/**
 * 合并默认的 params/data 到请求参数（请求优先）
 */
export function mergeDefaultParamsAndData(baseInit: RequestInitOptions, opts: RequestOptions): RequestOptions {
  const merged = { ...opts } as RequestOptions;

  // 解析 URL 中已有的查询参数（相对路径也尽量解析）
  const urlParamsObj: Record<string, string> = {};
  if (merged.url) {
    try {
      // 优先使用绝对 URL；若为相对且存在 baseUrl，则组合后解析
      if (/^https?:\/\//.test(merged.url)) {
        const u = new URL(merged.url);
        u.searchParams.forEach((v, k) => { urlParamsObj[k] = v; });
      } else if (baseInit.baseUrl) {
        const base = baseInit.baseUrl.endsWith('/') ? baseInit.baseUrl : baseInit.baseUrl + '/';
        const path = merged.url.startsWith('/') ? merged.url.slice(1) : merged.url;
        const u = new URL(path, base);
        u.searchParams.forEach((v, k) => { urlParamsObj[k] = v; });
      } else if (merged.url.includes('?')) {
        const q = merged.url.substring(merged.url.indexOf('?') + 1);
        const usp = new URLSearchParams(q);
        usp.forEach((v, k) => { urlParamsObj[k] = v; });
      }
    } catch { /* ignore parse errors */ }
  }

  // 合并 params（合并顺序：默认 params < URL 中的查询参数 < 请求 params；后者覆盖前者）
  const initParams = (baseInit as any).params as Record<string, any> | undefined;
  const reqParams = merged.params as Record<string, any> | undefined;
  if (initParams || reqParams || Object.keys(urlParamsObj).length > 0) {
    merged.params = _.merge({}, initParams || {}, urlParamsObj, reqParams || {});
  }

  // 合并 data
  const defaultData = (baseInit as any).defaultData as any;
  if (defaultData !== undefined && defaultData !== null) {
    const reqData = merged.data as any;
    const isDefaultObj = _.isPlainObject(defaultData);
    const isReqObj = _.isPlainObject(reqData);
    const isDefaultQS = defaultData instanceof URLSearchParams;
    const isReqQS = reqData instanceof URLSearchParams;
    if (reqData === undefined || reqData === null) {
      merged.data = defaultData as any;
    } else if (isDefaultObj && isReqObj) {
      merged.data = _.merge({}, defaultData, reqData);
    } else if (isDefaultQS && isReqQS) {
      const mergedQS = new URLSearchParams(defaultData as URLSearchParams);
      for (const [k, v] of (reqData as URLSearchParams).entries()) {
        mergedQS.set(k, v);
      }
      merged.data = mergedQS as any;
    }
  }
  return merged;
}

/**
 * 拼接 baseUrl 和相对路径
 */
export function resolveUrlWithBase(baseUrl: string | undefined, url?: string): string | undefined {
  if (!url) return url;
  if (!baseUrl || /^https?:\/\//.test(url)) return url;
  const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${base}${path}`;
}

/**
 * 如开启 CORS 预检，则进行预检请求
 */
export async function corsPreflightIfNeeded(curl: Curl, opts: RequestOptions) {
  if (!opts.cors) return;
  const corsOpts = _.merge({}, opts, {
    method: "OPTIONS",
    data: null,
    body: null,
    headers: { "Content-Type": null as any },
  });
  await setRequestOptions(curl, corsOpts);
  if (opts.sync) {
    // 动态导入，避免循环依赖
    const { requestSync } = await import("../impl/request_sync");
    await requestSync(corsOpts, curl);
  } else {
    const { request } = await import("../impl/request_sync");
    await request(corsOpts, curl);
  }
}

/**
 * 通用重试封装：由调用者提供单次尝试的逻辑（包含 reset/setOptions/emit 等）
 */
export async function withRetry<T>(retryCount: number, attempt: () => Promise<T>): Promise<T> {
  let left = retryCount ?? 0;
  let lastError: any;
  do {
    try {
      return await attempt();
    } catch (e) {
      lastError = e;
      if (left <= 0) throw e;
      // 可选：这里可以输出日志或钩子
    }
  } while (left-- > 0);
  throw lastError;
}