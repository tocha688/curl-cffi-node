# curl-cffi

A powerful HTTP client for Node.js based on libcurl with browser fingerprinting capabilities.

[English](https://github.com/tocha688/curl-cffi-node/blob/main/README.md) | [中文](https://github.com/tocha688/curl-cffi-node/blob/main/README.zh.md)

<a name="english"></a>

## Introduction

curl-cffi is a high-performance HTTP client library for Node.js built on libcurl. It provides synchronous and asynchronous request methods with powerful browser fingerprinting capabilities, making it ideal for web scraping, API testing, and automation tasks that require browser simulation.

### Key Features

- **Multiple Request Modes**: Support for synchronous and asynchronous requests
- **Browser Fingerprinting**: Simulate various browsers including Chrome, Firefox, Safari, Edge, and Tor
- **Session Management**: Maintain cookies and configurations across requests
- **Rich Configuration Options**: Comprehensive control over HTTP requests
- **JA3/TLS Fingerprinting**: Advanced TLS fingerprint simulation

### Use Cases

- Web scraping with browser simulation
- API testing and integration
- Automated web interactions
- Network request debugging
- Bypassing basic anti-bot measures

## Installation

```bash
npm install curl-cffi
```

## Basic Usage

### Simple Request

```javascript
const { req } = require("curl-cffi");

// Asynchronous request
async function makeGetRequest() {
  try {
    const response = await req.get("https://api.example.com/data", {
      impersonate: "chrome136", // Simulate Chrome 136
    });
    console.log("Status Code:", response.statusCode);
    console.log("Response Data:", response.data);
  } catch (error) {
    console.error("Request failed:", error);
  }
}

makeGetRequest();
```

### Synchronous and Asynchronous Requests

curl-cffi supports synchronous and asynchronous request modes:

```javascript
// Synchronous request
const { CurlRequestSync, CurlRequest, CurlMultiImpl } = require("curl-cffi");
const req = new CurlRequestSync();

// Asynchronous request implementation
const req2 = new CurlRequest();

// Multi-based asynchronous request
const req3 = new CurlClient({
  // Enable multi requests, which will reuse connections, not reused by default
  impl: new CurlMultiImpl(),
});
```

### Session Management

```javascript
// Session request
const req1 = new CurlSession();
// Asynchronous request without connection reuse
const req2 = new CurlSessionSync();
```

### Request Options

```javascript
type RequestOptions = {
  method?: RequestMethod,
  url?: string,
  params?: Record<string, any>,
  // Request data
  data?: Record<string, any> | string | null,
  // Cookie jar
  jar?: CookieJar,
  // Request headers
  headers?: Record<string, string>,
  auth?: RequestAuth,
  timeout?: number,
  allowRedirects?: boolean,
  maxRedirects?: number,
  // Proxy http://username:password@host:port
  proxy?: string,
  referer?: string,
  acceptEncoding?: string,
  // Enable curl fingerprint
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
  // Enable multi, which will reuse requests, not reused by default
  impl?: CurlMultiImpl,
  // Automatic retry count, default 0
  retryCount?: number,
  keepAlive?: boolean,
  // Enable curl logging
  dev?: boolean,
  // Simulate browser CORS request
  cors?: boolean,
  curl?: Curl,
};
```

### Response Parameters

```javascript
type CurlResponse={
  url: string,
  status: number,
  dataRaw?: Buffer,
  headers: HttpHeaders,
  request: CurlRequestInfo,
  options: RequestOptions,
  // Request stack, including automatic redirect content
  stacks: Array<CurlRequestInfo> = [],
  index: number = 0,
  redirects: number = 0,
  curl: Curl,
  jar:CookieJar,
  // Text format of response content
  text:string,
  // If response is JSON, auto-parse, otherwise
  data:any|string|Buffer,
}
```

### Performance Optimization

```
// Use global interface to reuse connections and improve performance
const req1=new CurlSession({impl:gimpl})
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

**Inspired by** [curl_cffi](https://github.com/lexiforest/curl_cffi)  
**libcurl** [curl-impersonate](https://github.com/lexiforest/curl-impersonate)
