import { CookieJar } from "tough-cookie";
import { requestSync } from "../src"

const res = requestSync({
    url: 'https://google.com',
    method: 'GET',
    impersonate: 'chrome',
    verify: false,
    jar:new CookieJar(),
})

console.log(res.statusCode);
console.log(res.data);
console.log(JSON.stringify(res.jar?.serializeSync()));