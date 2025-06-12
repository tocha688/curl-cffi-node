import { CookieJar } from "tough-cookie";
import { requestSync } from "../src"

const res = requestSync({
    url: 'https://www.google.com',
    // url: 'https://tls.peet.ws/api/all',
    method: 'GET',
    impersonate: 'chrome136',
    headers: {
        "Content-type": "application/json",
    },
    defaultHeaders: false,
    // verify: false,
    jar: new CookieJar(),
    proxy:"http://127.0.0.1:10808",
})

console.log(res.statusCode);
console.log(res.text);
console.log(JSON.stringify(res.jar?.serializeSync()));