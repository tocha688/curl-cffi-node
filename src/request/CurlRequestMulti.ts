import _ from "lodash";
import { Curl } from "@tocha688/libcurl";
import { CurlMultiImpl } from "../impl";
import { setRequestOptions } from "../helper";
import { CurlResponse, defaultInitOptions, RequestInitOptions, RequestOptions } from "../type";
import { CurlPool, CurlPoolOptions } from "../core/CurlPool";
import { BaseClient } from "./BaseClient";
import { corsPreflightIfNeeded, mergeDefaultParamsAndData, resolveUrlWithBase, withRetry } from "./shared";

/**
 * 批量请求客户端：基于 CurlMultiImpl（Timer/Event）进行大批量请求。
 * - 使用 CurlPool 为每个请求分配一个 easy Curl handle。
 * - 提供 batch() 批量接口和 request() 单个接口。
 */
export class CurlRequestMulti extends BaseClient {
  private readonly baseOptions: RequestInitOptions;
  private readonly baseUrl?: string;
  private readonly pool: CurlPool;
  private readonly multi: CurlMultiImpl;

  constructor(opts: RequestInitOptions = _.clone(defaultInitOptions), poolOptions: CurlPoolOptions = {}, multi?: CurlMultiImpl) {
    super();
    this.baseOptions = _.merge({}, defaultInitOptions, opts);
    this.baseUrl = opts.baseUrl;
    this.pool = new CurlPool(poolOptions);
    this.multi = multi ?? new CurlMultiImpl();
  }

  async request(options: RequestOptions): Promise<CurlResponse> {
    const curl = this.pool.acquire();
    const { baseUrl: _ignoredBaseUrl, ...reqOptions } = (options as any) ?? {};
    let opts = _.merge({}, this.baseOptions, reqOptions) as RequestOptions;
    // 合并默认 params/data（请求优先）
    opts = mergeDefaultParamsAndData(this.baseOptions, opts);
    // 处理 URL 拼接
    if (opts.url) {
      opts.url = resolveUrlWithBase(this.baseUrl, opts.url);
    }
    try {
      await corsPreflightIfNeeded(curl, opts);
      const res = await withRetry(opts.retryCount ?? 0, async () => {
        curl.reset();
        await setRequestOptions(curl, opts);
        return await this.multi.request(opts, curl);
      });
      return res;
    } finally {
      this.pool.release(curl);
    }
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
    this.pool.close();
  }
}