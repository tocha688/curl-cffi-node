export type InterceptorOptions<T> = {
  runIf?: (value: T) => boolean;
  priority?: number; // 越大优先级越高
};

export type InterceptorHandler<T> = {
  fulfilled?: (value: T) => Promise<T> | T;
  rejected?: (error: any, value?: T) => Promise<T> | T;
  options?: InterceptorOptions<T>;
};

/**
 * 拦截器管理器，支持 axios 风格：
 * - request 拦截器按 LIFO（后加先执行）
 * - response 拦截器按 FIFO（先加先执行）
 * - 支持条件运行（runIf）与优先级（priority）
 */
export class InterceptorManager<T> {
  private seq: number = 1;
  private items: Map<number, InterceptorHandler<T>> = new Map();
  constructor(private readonly mode: 'request' | 'response' = 'response') {}

  use(
    fulfilled?: (value: T) => Promise<T> | T,
    rejected?: (error: any, value?: T) => Promise<T> | T,
    options?: InterceptorOptions<T>
  ): number {
    const id = this.seq++;
    this.items.set(id, { fulfilled, rejected, options });
    return id;
  }

  eject(id: number) {
    this.items.delete(id);
  }

  clear() {
    this.items.clear();
  }

  list(): Array<[number, InterceptorHandler<T>]> {
    const list = Array.from(this.items.entries());
    // priority 越大越靠前
    list.sort((a, b) => (b[1].options?.priority ?? 0) - (a[1].options?.priority ?? 0));
    // request 为 LIFO：优先执行后注册的（在同一优先级下反向）
    if (this.mode === 'request') list.reverse();
    return list;
  }

  async runFulfilled(value: T): Promise<T> {
    let v = value;
    const list = this.list();
    for (const [, h] of list) {
      if (h.fulfilled && (!h.options?.runIf || h.options.runIf(v))) {
        v = await h.fulfilled(v);
      }
    }
    return v;
  }

  async runRejected(error: any, value?: T): Promise<T | undefined> {
    let v = value;
    let err = error;
    const list = this.list();
    let handled = false;
    for (const [, h] of list) {
      if (h.rejected) {
        const maybe = await h.rejected(err, v);
        if (maybe !== undefined) {
          v = maybe as T;
          handled = true;
          break;
        }
      }
    }
    return handled ? (v as T) : undefined;
  }
}