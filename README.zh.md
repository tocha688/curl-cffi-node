# curl-cffi

基于 libcurl 的强大 Node.js HTTP 客户端，具备浏览器指纹识别功能。

[English](https://github.com/tocha688/curl-cffi-node/blob/main/README.md) | [中文](https://github.com/tocha688/curl-cffi-node/blob/main/README.zh.md)

<a name="chinese"></a>

## 介绍

curl-cffi 是一个基于 libcurl 构建的高性能 Node.js HTTP 客户端库。它提供同步和异步请求方法，具有强大的浏览器指纹识别功能，非常适合网络爬虫、API 测试和需要浏览器模拟的自动化任务。

### 主要特性

- **多种请求模式**：支持同步和异步请求
- **浏览器指纹识别**：模拟各种浏览器，包括 Chrome、Firefox、Safari、Edge 和 Tor
- **会话管理**：在请求之间维护 cookie 和配置
- **丰富的配置选项**：全面控制 HTTP 请求
- **JA3/TLS 指纹识别**：高级 TLS 指纹模拟

### 使用场景

- 带浏览器模拟的网络爬虫
- API 测试和集成
- 自动化网络交互
- 网络请求调试
- 绕过基本的反机器人措施

## 安装

```bash
npm install curl-cffi
```

## 基本用法

### 简单请求

```javascript
const { req } = require("curl-cffi");

// 异步请求
async function makeGetRequest() {
  try {
    const response = await req.get("https://api.example.com/data", {
      impersonate: "chrome136", // 模拟 Chrome 136
    });
    console.log("状态码:", response.statusCode);
    console.log("响应数据:", response.data);
  } catch (error) {
    console.error("请求失败:", error);
  }
}

makeGetRequest();
```

### 同步和异步请求

curl-cffi 支持同步和异步请求模式：

```javascript
// 同步请求
const { CurlRequestSync, CurlRequest, CurlMultiImpl } = require("curl-cffi");
const req = new CurlRequestSync();

// 异步请求实现
const req2 = new CurlRequest();

// 基于multi的异步请求
const req3 = new CurlClient({
  //启用multi请求，这将复用请求，默认不会复用
  impl: new CurlMultiImpl(),
});
```

### 会话管理

```javascript
// 会话请求
const req1 = new CurlSession();
// 异步请求 不复用连接
const req2 = new CurlSessionSync();
```

### 请求参数

```javascript
type RequestOptions = {
  method?: RequestMethod,
  url?: string,
  params?: Record<string, any>,
  //请求数据
  data?: Record<string, any> | string | null,
  //cookie jar
  jar?: CookieJar,
  //请求头
  headers?: Record<string, string>,
  auth?: RequestAuth,
  timeout?: number,
  allowRedirects?: boolean,
  maxRedirects?: number,
  //代理 http://username:password@host:port
  proxy?: string,
  referer?: string,
  acceptEncoding?: string,
  //开启curl指纹
  impersonate?: CURL_IMPERSONATE,
  ja3?: string,
  akamai?: string,
  defaultHeaders?: boolean,
  defaultEncoding?: string,
  httpVersion?: HttpVersion | number,
  interface?: string,
  cert?: string | RequestCert,
  verify?: boolean,
  maxRecvSpeed?: number,
  curlOptions?: Record<CurlOpt, string | number | boolean>,
  ipType?: IpType,
  //开启multi，这将复用请求，默认不会复用
  impl?: CurlMultiImpl,
  //自动重试次数，默认0
  retryCount?: number,
  keepAlive?: boolean,
  //开启curl日志
  dev?: boolean,
  //模拟浏览器跨域请求
  cors?: boolean,
  curl?: Curl,
};
```

### 响应参数

```javascript
type CurlResponse={
  url: string，
  status: number，
  dataRaw?: Buffer，
  headers: HttpHeaders，
  request: CurlRequestInfo，
  options: RequestOptions，
  //请求堆栈，包含了自动重定向的内容
  stacks: Array<CurlRequestInfo> = []，
  index: number = 0，
  redirects: number = 0，
  curl: Curl，
  jar:CookieJar,
  //响应内容的文本格式
  text:string,
  //如果响应json则自动解析，否则
  data:any|string|Buffer,
}
```



### 性能优化

```
// 使用全局接口，复用连接，提高性能
const req1=new CurlSession({impl:gimpl})
```

## 许可证

本项目采用 MIT 许可证 - 详情请参阅 LICENSE 文件。

**启发** [curl_cffi](https://github.com/lexiforest/curl_cffi)  
**libcurl** [curl-impersonate](https://github.com/lexiforest/curl-impersonate)

