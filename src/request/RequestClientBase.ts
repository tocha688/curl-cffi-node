import { Curl } from "@tocha688/libcurl";
import _ from "lodash";
import { setRequestOptions } from "../helper";
import { CurlResponse, defaultInitOptions, RequestInitOptions, RequestOptions } from "../type";
import { CurlPool, CurlPoolOptions } from "../core/CurlPool";
import { BaseClient } from "./BaseClient";
import { corsPreflightIfNeeded, mergeDefaultParamsAndData, resolveUrlWithBase, withRetry } from "./shared";

/**
 * 通用请求基类：抽取 CurlRequest/CurlRequestMulti 的重复逻辑。
 * - 统一维护 opts/baseUrl/CurlPool
 * - 统一准备请求参数（默认值合并、URL 拼接）
 * - 统一 CORS 预检、setRequestOptions、重试与资源释放
 * 子类只需实现 send(curl, opts) 来决定具体的发送方式。
 */
export abstract class RequestClientBase extends BaseClient {
  readonly opts: RequestInitOptions;
  protected readonly baseUrl?: string;
  protected readonly pool: CurlPool;

  constructor(opts: RequestInitOptions = _.clone(defaultInitOptions), poolOptions: CurlPoolOptions = {}) {
    super();
    this.opts = _.merge({}, defaultInitOptions, opts);
    this.baseUrl = opts.baseUrl;
    this.pool = new CurlPool(poolOptions);
  }

  protected prepareOptions(options: RequestOptions): RequestOptions {
    const { baseUrl: _ignoredBaseUrl, ...reqOptions } = (options as any) ?? {};
    let opts = _.merge({}, this.opts, reqOptions) as RequestOptions;
    // 合并默认 params/data（请求优先，考虑 URL 已含查询参数）
    opts = mergeDefaultParamsAndData(this.opts, opts);
    // 处理 baseUrl 与相对路径
    if (opts.url) {
      opts.url = resolveUrlWithBase(this.baseUrl, opts.url);
    }
    return opts;
  }

  protected abstract send(curl: Curl, opts: RequestOptions): Promise<CurlResponse>;

  async request(options: RequestOptions): Promise<CurlResponse> {
    const curl = this.pool.acquire();
    const opts = this.prepareOptions(options);
    try {
      // CORS 预检
      await corsPreflightIfNeeded(curl, opts);
      // 重试封装 + 通用 setRequestOptions
      const res = await withRetry(opts.retryCount ?? 0, async () => {
        curl.reset();
        await setRequestOptions(curl, opts);
        return await this.send(curl, opts);
      });
      return res;
    } finally {
      // 释放到池中以便后续复用
      this.pool.release(curl);
    }
  }

  get jar() { return this.opts.jar; }
  get baseURL() { return this.baseUrl; }

  close() {
    this.pool.close();
  }
}