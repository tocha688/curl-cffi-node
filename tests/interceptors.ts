import { CurlRequest } from "../src/request/CurlRequest";
import { curlGlobalInit } from "../src/impl";

curlGlobalInit();

async function testInterceptors() {
  console.log("=== 测试拦截器系统（类似 axios） ===");

  const client = new CurlRequest({
    baseUrl: "https://httpbin.org",
    timeout: 10000,
    params: { base: "1" },
  });

  // 请求拦截器：为请求加上 headers/params；测试优先级与条件
  client.interceptors.request.use((opts) => {
    opts.headers = { ...(opts.headers || {}), "X-Req-One": "one" };
    opts.params = { ...(opts.params || {}), r1: "1" };
    return opts;
  }, undefined, { priority: 1 });

  client.interceptors.request.use((opts) => {
    opts.headers = { ...(opts.headers || {}), "X-Req-Two": "two" };
    opts.params = { ...(opts.params || {}), r2: "2" };
    return opts;
  }, undefined, { priority: 5 });

  // 条件拦截器：仅在 /get 路径下运行
  client.interceptors.request.use((opts) => {
    opts.params = { ...(opts.params || {}), cond: "yes" };
    return opts;
  }, undefined, { runIf: (opts) => !!opts.url && opts.url.includes("/get") });

  // 优先级测试：最终应以高优先级覆盖（X-Order=high）
  client.interceptors.request.use((opts) => {
    opts.headers = { ...(opts.headers || {}), "X-Order": "low" };
    return opts;
  }, undefined, { priority: 1 });

  client.interceptors.request.use((opts) => {
    opts.headers = { ...(opts.headers || {}), "X-Order": "high" };
    return opts;
  }, undefined, { priority: 10 });

  // 请求错误拦截器：当 URL 包含 /trigger 时抛错，在 rejected 中恢复为 /get
  client.interceptors.request.use(
    (opts) => {
      if (opts.url?.includes("/trigger")) throw new Error("request boom");
      return opts;
    },
    (err, opts) => {
      if (opts?.url?.includes("/trigger")) {
        return { ...opts, url: "/get", params: { ...(opts.params || {}), reqrecover: "1" } };
      }
      return opts!;
    }
  );

  // 响应拦截器：将 dataRaw 替换为带标记的 JSON（避免直接赋值 res.data，因为它是只读 getter）
  client.interceptors.response.use(async (res) => {
    let obj: any = undefined;
    if (typeof res.data === "string") {
      try { obj = JSON.parse(res.data); } catch {}
    } else if (typeof res.data === "object" && res.data) {
      obj = res.data;
    }
    if (obj && typeof obj === "object") {
      obj.tag = "fulfilled";
      res.dataRaw = Buffer.from(JSON.stringify(obj), "utf-8");
    }
    return res;
  });

  // 响应错误拦截器：网络错误时返回降级响应
  client.interceptors.response.use(
    undefined,
    async (error) => {
      return {
        status: 200,
        data: { recovered: true },
        headers: {},
        body: "",
        url: "fallback",
        config: undefined,
        time: Date.now(),
      } as any;
    }
  );

  // 1) 正常 GET：应包含合并后的 params 与 headers；X-Order=high
  console.log("\n1. 正常 GET /get?a=1");
  const r1 = await client.get("/get?a=1");
  console.log("状态码:", r1.status);
  console.log("请求 URL:", typeof r1.data === "object" ? (r1.data as any).url : "N/A");
  console.log("查询参数:", typeof r1.data === "object" ? (r1.data as any).args : "N/A");
  console.log("请求头部分:", typeof r1.data === "object" ? {
    XReqOne: (r1.data as any).headers?.["X-Req-One"],
    XReqTwo: (r1.data as any).headers?.["X-Req-Two"],
    XOrder: (r1.data as any).headers?.["X-Order"],
  } : "N/A");

  // 2) 请求错误恢复：/trigger -> 被恢复为 /get，并带 reqrecover=1
  console.log("\n2. 请求错误恢复 /trigger");
  const r2 = await client.get("/trigger");
  console.log("状态码:", r2.status);
  console.log("请求 URL:", typeof r2.data === "object" ? (r2.data as any).url : "N/A");
  console.log("查询参数:", typeof r2.data === "object" ? (r2.data as any).args : "N/A");

  // 3) 响应错误恢复：访问不存在域名，返回降级响应
  console.log("\n3. 响应错误恢复 invalid 域名");
  const r3 = await client.get("https://nonexistent.example.invalid");
  console.log("状态码:", r3.status);
  console.log("恢复标记:", typeof r3.data === "object" ? (r3.data as any).recovered : "N/A");
}

testInterceptors().catch(console.error);