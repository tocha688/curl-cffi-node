import { Curl } from "@tocha688/libcurl";
import _ from "lodash";
import { request, requestSync } from "../impl";
import { CurlResponse, defaultInitOptions, RequestOptions, RequestInitOptions } from "../type";
import { CurlPoolOptions } from "../core/CurlPool";
import { RequestClientBase } from "./RequestClientBase";

/**
 * 单请求客户端：默认直接使用 Curl.perform/send 发起请求。
 * - 自动缓存 Curl（通过 CurlPool），下次优先复用；如池内都在用则新建 Curl。
 * - 支持 session（通过在 opts 中传入 jar）。
 * - 支持 CORS 预检与重试、请求/响应事件钩子。
 * - 支持 baseUrl，自动拼接相对路径。
 */
export class CurlRequest extends RequestClientBase {

  constructor(opts: RequestInitOptions = _.clone(defaultInitOptions), poolOptions: CurlPoolOptions = {}) {
    super(opts, poolOptions);
  }

  protected async send(curl: Curl, opts: RequestOptions): Promise<CurlResponse> {
    return await (opts.sync ? requestSync(opts, curl) : request(opts, curl));
  }

  // 便捷方法由 BaseClient 统一提供

  // 便捷 getter 与关闭操作由基类提供
}