import { Curl } from "@tocha688/libcurl"
import { CurlClient, CurlClientLoop, Logger } from "../src"
import { CookieJar } from "tough-cookie";
// Logger.level= 4; // 设置日志级别为 debug

const req = new CurlClientLoop()

const watis = [] as Array<Promise<any>>;
console.time('request');
watis.push(req.request({
    url: 'https://tls.peet.ws/api/all',
}).then(res => {
    console.timeEnd('request');
    console.log("请求成功 111", res.status);
}).catch(err => {
    console.log("请求错误", err.message)
}))

// watis.push(req.request({
//     url: 'https://tls.peet.ws/api/all',
// }).then(res => {
//     console.log("请求成功 222",res.statusCode);
// }).catch(err => {
//     console.log("请求错误", err.message)
// }))

// watis.push(req.request({
//    url: 'https://google.com',
//     method: 'GET',
//     impersonate: 'chrome136',
//     headers: {
//         "Content-type": "application/json",
//     },
//     // defaultHeaders: false,
//     allowRedirects:false,
//     // verify: false,
//     // jar: new CookieJar(),
//     proxy:"http://127.0.0.1:10808",
// }).then(res => {
//     console.log("Google请求完成", res.statusCode);
//     // console.log(res.text);
// }).catch(err => {
//     console.log("Google请求失败", err.message)
// }))

Promise.all(watis).finally(() => {
    // req.close();
    // console.log("所有请求完成，关闭连接池");
})

