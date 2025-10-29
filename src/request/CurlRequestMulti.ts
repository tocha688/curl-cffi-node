import _ from "lodash";
import { Curl } from "@tocha688/libcurl";
import { CurlMultiImpl } from "../impl";
import { setRequestOptions } from "../helper";
import { CurlResponse, defaultInitOptions, RequestInitOptions, RequestOptions } from "../type";
import { CurlPoolOptions } from "../core/CurlPool";
import { RequestClientBase } from "./RequestClientBase";
import { corsPreflightIfNeeded, mergeDefaultParamsAndData, resolveUrlWithBase, withRetry } from "./shared";

/**
 * 批量请求客户端：基于 CurlMultiImpl（Timer/Event）进行大批量请求。
 * - 使用 CurlPool 为每个请求分配一个 easy Curl handle。
 * - 提供 batch() 批量接口和 request() 单个接口。
 */
export class CurlRequestMulti extends RequestClientBase {
  private readonly multi: CurlMultiImpl;

  constructor(opts: RequestInitOptions = _.clone(defaultInitOptions), poolOptions: CurlPoolOptions = {}, multi?: CurlMultiImpl) {
    super(opts, poolOptions);
    this.multi = multi ?? new CurlMultiImpl();
  }

  protected async send(curl: Curl, opts: RequestOptions): Promise<CurlResponse> {
    return await this.multi.request(opts, curl);
  }

  /**
   * 批量请求：并发提交到 curl_multi，返回每个请求的 Promise。
   */
  batch(requests: RequestOptions[]): Promise<CurlResponse[]> {
    const tasks = requests.map((r) => this.request(r));
    return Promise.all(tasks);
  }

  // 便捷方法由 BaseClient 统一提供

  close() {
    this.multi.close();
    super.close();
  }
}