import { CurlRequest } from "../src/request/CurlRequest";
import { curlGlobalInit } from "../src/impl";

// 初始化 libcurl
curlGlobalInit();

async function testBaseUrl() {
  console.log("=== 测试 baseUrl 功能 ===");
  
  // 创建带 baseUrl 的客户端
  const client = new CurlRequest({
    baseUrl: "https://httpbin.org",
    timeout: 10000
  });

  try {
    // 测试相对路径
    console.log("1. 测试相对路径 '/get'");
    const response1 = await client.get("/get");
    console.log(`状态码: ${response1.status}`);
    console.log(`响应数据类型: ${typeof response1.data}`);
    
    if (typeof response1.data === 'string') {
      try {
        const data1 = JSON.parse(response1.data);
        console.log(`请求 URL: ${data1.url}`);
      } catch (e) {
        console.log(`响应数据前100字符: ${response1.data.substring(0, 100)}`);
      }
    } else {
      console.log(`响应数据: ${JSON.stringify(response1.data)}`);
      console.log(`请求 URL: ${response1.data?.url || 'N/A'}`);
    }

    // 测试不带斜杠的相对路径
    console.log("\n2. 测试相对路径 'ip'");
    const response2 = await client.get("ip");
    console.log(`状态码: ${response2.status}`);
    
    if (typeof response2.data === 'string') {
      try {
        const data2 = JSON.parse(response2.data);
        console.log(`请求 URL: ${data2.url || 'N/A'}`);
        console.log(`IP 信息: ${JSON.stringify(data2)}`);
      } catch (e) {
        console.log(`响应数据: ${response2.data.substring(0, 100)}`);
      }
    } else {
      console.log(`响应数据: ${JSON.stringify(response2.data)}`);
      console.log(`请求 URL: ${response2.data?.url || 'N/A'}`);
    }

    // 测试绝对路径（应该忽略 baseUrl）
    console.log("\n3. 测试绝对路径");
    const response3 = await client.get("https://httpbin.org/user-agent");
    console.log(`状态码: ${response3.status}`);
    
    if (typeof response3.data === 'string') {
      try {
        const data3 = JSON.parse(response3.data);
        console.log(`请求 URL: ${data3.url}`);
      } catch (e) {
        console.log(`响应数据: ${response3.data.substring(0, 100)}`);
      }
    } else {
      console.log(`响应数据: ${JSON.stringify(response3.data)}`);
      console.log(`请求 URL: ${response3.data?.url || 'N/A'}`);
    }

    // 测试 POST 请求
    console.log("\n4. 测试 POST 请求");
    const response4 = await client.post("/post", { test: "data" });
    console.log(`状态码: ${response4.status}`);
    
    if (typeof response4.data === 'string') {
      try {
        const postData = JSON.parse(response4.data);
        console.log(`请求 URL: ${postData.url}`);
        console.log(`POST 数据: ${JSON.stringify(postData.json)}`);
      } catch (e) {
        console.log(`响应数据: ${response4.data.substring(0, 100)}`);
      }
    } else {
      console.log(`响应数据: ${JSON.stringify(response4.data)}`);
      console.log(`请求 URL: ${response4.data?.url || 'N/A'}`);
    }

    // 测试 baseURL getter
    console.log(`\n5. baseURL getter: ${client.baseURL}`);

  } catch (error) {
    console.error("测试失败:", error);
  } finally {
    client.close();
  }
}

// 运行测试
testBaseUrl().catch(console.error);