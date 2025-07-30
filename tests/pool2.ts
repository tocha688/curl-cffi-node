import pLimit from "p-limit";
import { CurlSession } from "../dist/index.mjs";

console.log("开始任务")
const limit = pLimit(200);
const watis = [] as any[];
for (let i = 0; i < 5000; i++) {
    watis.push(limit(async () => {
        const req = new CurlSession({
            impersonate: 'chrome136',
        })
        await req.request({
            url: 'https://ipinfo.thordata.com',
            method: 'GET',
            impersonate: 'chrome136',
            headers: {
                "Content-type": "application/json",
            },
            allowRedirects: false,
        }).then(res => {
            // console.log(i, "请求完成", res.status);
            // console.log(res.text);
        }).catch(err => {
            // console.log(i, "请求失败", err.message)
        })
    }))
}
await Promise.all(watis);
console.log("所有请求已提交，请进行分析");
setInterval(() => { }, 10000)