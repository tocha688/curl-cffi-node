import { CurlClient, CurlSession, gimpl } from "../src";

const createHeaders = () => {
    return {
        Accept: "application/json, text/javascript, */*; q=0.01",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;qs=0.6",
        "Content-Type": "application/json",
        // Uncomment and set your cookies if needed
        // 'Cookie': 'dssid2=70586468-c020-4afb-9090-87b2f84a083d; ...',
        Origin: "https://idmsa.apple.com",
        Referer: "https://idmsa.apple.com/",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        // "User-Agent": faker.internet.userAgent(),
        "sec-ch-ua":
            '"Microsoft Edge";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
    };
};
const client = new CurlClient({
    timeout: 30 * 1000,
    impersonate: "chrome136",
    impl: gimpl,
    keepAlive: true,
    proxy: "http://td-customer-xWUYDbwo9r59:XuWKY2d099to@47fnsjrv.pr.thordata.net:9999"
});
for (let index = 0; index < 3; index++) {
    const headers = createHeaders();
    // const res = await client.post(
    //     "https://idmsa.apple.com/appleauth/auth/federate?isRememberMeEnabled=false",
    //     { accountName: "+111111111111", rememberMe: false },
    //     { headers, impersonate: "chrome136" }
    // );
    const res = await client.get(
        "https://ipinfo.thordata.com",
        { headers, impersonate: "chrome136" }
    );
    console.log(res.status, res.text);
}