import _ from "lodash";
import { Curl } from "@tocha688/libcurl";
import { CurlMultiImpl } from "../impl";
import { setRequestOptions } from "../helper";
import { CurlResponse, defaultRequestOption, RequestOptions } from "../type";
import { CurlPool, CurlPoolOptions } from "../core/CurlPool";
import { BaseClient } from "./BaseClient";

/**
 * 批量请求客户端：基于 CurlMultiImpl（Timer/Event）进行大批量请求。
 * - 使用 CurlPool 为每个请求分配一个 easy Curl handle。
 * - 提供 batch() 批量接口和 request() 单个接口。
 */
export class CurlRequestMulti extends BaseClient {
  private readonly baseOptions: RequestOptions;
  private readonly pool: CurlPool;
  private readonly multi: CurlMultiImpl;

  constructor(opts: RequestOptions = _.clone(defaultRequestOption), poolOptions: CurlPoolOptions = {}, multi?: CurlMultiImpl) {
    super();
    this.baseOptions = _.merge({}, defaultRequestOption, opts);
    this.pool = new CurlPool(poolOptions);
    this.multi = multi ?? new CurlMultiImpl();
  }

  async request(options: RequestOptions): Promise<CurlResponse> {
    const curl = this.pool.acquire();
    const opts = _.merge({}, this.baseOptions, options);
    try {
      curl.reset();
      await setRequestOptions(curl, opts);
      return await this.multi.request(opts, curl);
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