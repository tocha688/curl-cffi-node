import { Curl } from "@tocha688/libcurl";
import _ from "lodash";
import { setRequestOptions } from "../helper";
import { request, requestSync } from "../impl";
import { CurlResponse, defaultInitOptions, RequestEvent, RequestOptions, RequestInitOptions, ResponseEvent } from "../type";
import { CurlPool, CurlPoolOptions } from "../core/CurlPool";
import { BaseClient } from "./BaseClient";

/**
 * 单请求客户端：默认直接使用 Curl.perform/send 发起请求。
 * - 自动缓存 Curl（通过 CurlPool），下次优先复用；如池内都在用则新建 Curl。
 * - 支持 session（通过在 baseOptions 中传入 jar）。
 * - 支持 CORS 预检与重试、请求/响应事件钩子。
 * - 支持 baseUrl，自动拼接相对路径。
 */
export class CurlRequest extends BaseClient {
  private readonly baseOptions: RequestInitOptions;
  private readonly pool: CurlPool;
  private readonly baseUrl?: string;
  private reqs: Set<RequestEvent> = new Set();
  private resps: Set<ResponseEvent> = new Set();

  constructor(opts: RequestInitOptions = _.clone(defaultInitOptions), poolOptions: CurlPoolOptions = {}) {
    super();
    this.baseOptions = _.merge({}, defaultInitOptions, opts);
    this.baseUrl = opts.baseUrl;
    this.pool = new CurlPool(poolOptions);
  }

  onRequest(event: RequestEvent) {
    this.reqs.add(event);
  }
  onResponse(event: ResponseEvent) {
    this.resps.add(event);
  }

  /**
   * 拼接 baseUrl 和相对路径
   */
  private resolveUrl(url: string): string {
    if (!this.baseUrl || this.isAbsoluteUrl(url)) {
      return url;
    }
    
    // 处理路径分隔符
    const base = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${base}${path}`;
  }

  /**
   * 检查是否为绝对 URL
   */
  private isAbsoluteUrl(url: string): boolean {
    return /^https?:\/\//.test(url);
  }
  private async emits<T>(data: T, calls: Set<(d: T) => Promise<T>>): Promise<T> {
    for (const call of calls) data = await call(data);
    return data;
  }

  async request(options: RequestOptions): Promise<CurlResponse> {
    const curl = this.pool.acquire();
    // 防止单次请求覆盖初始化的 baseUrl（即使用户绕过类型传入）
    const { baseUrl: _ignoredBaseUrl, ...reqOptions } = (options as any) ?? {};
    const opts = _.merge({}, this.baseOptions, reqOptions) as RequestOptions;
    
    // 处理 URL 拼接
    if (opts.url) {
      opts.url = this.resolveUrl(opts.url);
    }

    // CORS 预检
    if (opts.cors) {
      const corsOpts = _.merge({}, opts, {
        method: "OPTIONS",
        data: null,
        body: null,
        headers: { "Content-Type": null as any },
      });
      await setRequestOptions(curl, corsOpts);
      await (corsOpts.sync ? requestSync(corsOpts, curl) : request(corsOpts, curl));
    }

    // 正常请求 + 重试
    let retryCount = opts.retryCount ?? 0;
    let result: CurlResponse | undefined;
    try {
      do {
        try {
          curl.reset();
          await setRequestOptions(curl, opts);
          await this.emits(opts, this.reqs);
          result = await (opts.sync ? requestSync(opts, curl) : request(opts, curl));
          break; // 成功
        } catch (e) {
          if (retryCount <= 0) throw e;
          // 继续重试
        }
      } while (retryCount-- > 0);
      result = await this.emits(result as CurlResponse, this.resps);
      return result as CurlResponse;
    } finally {
      // 释放到池中以便后续复用
      this.pool.release(curl);
    }
  }

  // 便捷方法由 BaseClient 统一提供

  get jar() { return this.baseOptions.jar; }
  get baseURL() { return this.baseUrl; }

  close() {
    this.pool.close();
  }
}