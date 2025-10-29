import { Curl } from "@tocha688/libcurl";
// 避免通过 request/index 的聚合导出引入 session.ts 导致循环依赖
import { storageCurls } from "../request/global";

type PoolItem = {
  curl: Curl;
  busy: boolean;
  lastUsed: number;
};

export type CurlPoolOptions = {
  maxSize?: number; // 最大连接数，默认无限制
  idleTTL?: number; // 空闲连接存活时间(ms)，默认 60_000
};

/**
 * CurlPool 管理 Curl 连接的获取与复用：
 * - acquire()：获取一个空闲 Curl，若没有则新建（不超过 maxSize）
 * - release(curl)：释放 Curl，标记为空闲并记录最后使用时间
 * - prune()：清理超过 idleTTL 的空闲连接
 * - close()：关闭池内所有连接
 */
export class CurlPool {
  private items: PoolItem[] = [];
  private readonly maxSize: number;
  private readonly idleTTL: number;
  private pruneTimer?: NodeJS.Timeout;

  constructor(opts: CurlPoolOptions = {}) {
    this.maxSize = opts.maxSize ?? Number.POSITIVE_INFINITY;
    this.idleTTL = opts.idleTTL ?? 60_000;
    this.startPrune();
    storageCurls.add(this);
  }

  acquire(): Curl {
    // 查找空闲且不忙的 Curl
    const idle = this.items.find((it) => !it.busy);
    if (idle) {
      idle.busy = true;
      return idle.curl;
    }

    // 若池未满则创建新 Curl
    if (this.items.length < this.maxSize) {
      const curl = new Curl();
      const item: PoolItem = { curl, busy: true, lastUsed: Date.now() };
      this.items.push(item);
      return curl;
    }

    // 池已满则仍创建“临时” Curl（不进入池，调用方使用后自行关闭）
    // 以避免并发等待阻塞
    return new Curl();
  }

  release(curl: Curl): void {
    const it = this.items.find((x) => x.curl === curl);
    if (!it) {
      // 非池内 curl，直接关闭
      try { curl.close(); } catch { /* ignore */ }
      return;
    }
    it.busy = false;
    it.lastUsed = Date.now();
  }

  private startPrune() {
    this.pruneTimer && clearInterval(this.pruneTimer);
    this.pruneTimer = setInterval(() => this.prune(), Math.min(this.idleTTL, 60_000));
    this.pruneTimer.unref();
  }

  prune(): void {
    const now = Date.now();
    const remain: PoolItem[] = [];
    for (const it of this.items) {
      // 仅清理空闲且超过 TTL 的连接
      if (!it.busy && now - it.lastUsed > this.idleTTL) {
        try { it.curl.close(); } catch { /* ignore */ }
      } else {
        remain.push(it);
      }
    }
    this.items = remain;
  }

  size(): number { return this.items.length; }

  close(): void {
    this.pruneTimer && clearInterval(this.pruneTimer);
    this.pruneTimer = undefined;
    for (const it of this.items) {
      try { it.curl.close(); } catch { /* ignore */ }
    }
    this.items = [];
  }
}