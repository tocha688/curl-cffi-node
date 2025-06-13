# curl-cffi

基于 libcurl 的强大 Node.js HTTP 客户端，具备浏览器指纹识别功能。

[English](README.md) | [中文](#chinese)

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
const { req } = require('curl-cffi');

// 异步请求
async function makeGetRequest() {
  try {
    const response = await req.get('https://api.example.com/data');
    console.log('状态码:', response.statusCode);
    console.log('响应数据:', response.data);
  } catch (error) {
    console.error('请求失败:', error);
  }
}

makeGetRequest();
```

### 同步和异步请求

curl-cffi 支持同步和异步请求模式：

```javascript
// 同步请求
const { CurlRequestSync } = require('curl-cffi');
const syncCurl = new CurlRequestSync();

// 基于事件的异步请求实现
const { CurlRequest } = require('curl-cffi');
const asyncCurl = new CurlRequest();

// 基于定时器的异步请求实现
const { CurlRequestLoop } = require('curl-cffi');
const loopCurl = new CurlRequestLoop();
```

### 会话管理

```javascript
const { CurlSession,CurlSessionSync,CurlSessionLoop } = require('curl-cffi');
// 会话请求
const req1=new CurlSession()
// 基于事件的异步请求实现
const req2=new CurlSessionSync()
// 基于定时器的异步请求实现
const req3=new CurlSessionLoop()
```

## 许可证

本项目采用 MIT 许可证 - 详情请参阅 LICENSE 文件。
