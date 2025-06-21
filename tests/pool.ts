import pLimit from "p-limit";
import { CurlSession, gimpl } from "../src";

const limit = pLimit(200);

for (let i = 0; i < 10000; i++) {
    limit(async () => {
        const req = new CurlSession({
            impl: gimpl,
            impersonate: 'chrome136',
        })
        await req.request({
            url: 'https://google.com',
            method: 'GET',
            impersonate: 'chrome136',
            headers: {
                "Content-type": "application/json",
            },
            // defaultHeaders: false,
            allowRedirects: false,
            // verify: false,
            // jar: new CookieJar(),
            proxy: "http://127.0.0.1:10808",
        }).then(res => {
            console.log(i, "Google请求完成", res.status);
            // console.log(res.text);
        }).catch(err => {
            console.log(i, "Google请求失败", err.message)
        })
    })

}
