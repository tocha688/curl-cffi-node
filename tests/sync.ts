import { CookieJar } from "tough-cookie";
import { CurlClientSync } from "../src"

const req = new CurlClientSync();
console.time('request');
req.request({
    // url: 'https://postman-echo.com/post',
    url: 'https://tls.peet.ws/api/all',
    // url: "http://google.com",
    method: 'GET',
    impersonate: 'chrome136',
    // headers: {
    //     "Content-type": "application/json",
    // },
    // data: {
    //     "name": "curl-cffi-node",
    //     "version": "0.0.1",
    // },
    // defaultHeaders: false,
    verify: false,
    allowRedirects: true,
    // timeout: 1,
    // jar: new CookieJar(),
    // proxy: "http://127.0.0.1:10808",
}).then(res => {
    console.timeEnd('request');
    console.log(res.status);
    console.log(res.redirects);
    console.log(JSON.stringify(res.jar?.serializeSync()));
})

