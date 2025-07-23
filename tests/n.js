fetch("https://idmsa.apple.com/appleauth/auth/federate?isRememberMeEnabled=false", {
    "headers": {
        "accept": "application/json, text/javascript, */*; q=0.01",
        "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
        "content-type": "application/json",
        "sec-ch-ua": "\"Not)A;Brand\";v=\"8\", \"Chromium\";v=\"138\", \"Microsoft Edge\";v=\"138\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-apple-auth-attributes": "YzA9GmXW+veWT8bcTUAAEWfOiB5w6Q==",
        "x-apple-domain-id": "2",
        "x-apple-frame-id": "auth-6z40pthq-2ldq-76eu-z4g6-902d7d2x",
        "x-apple-i-fd-client-info": "{\"U\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0\",\"L\":\"zh-CN\",\"Z\":\"GMT+08:00\",\"V\":\"1.1\",\"F\":\"7la44j1e3NlY5BNlY5BSmHACVZXnNA9Qc09_EKEKYfSHolk2dUJKy_Aw7GY5J4w.Tf5.EKWJ9Y6Hb9ItTfw9btTclY5BNleBBNlYCa1nkBMfs.DsX\"}",
        "x-apple-i-require-ue": "true",
        "x-apple-locale": "en_us",
        "x-apple-mandate-security-upgrade": "0",
        "x-apple-widget-key": "06f8d74b71c73757a2f82158d5e948ae7bae11ec45fda9a58690f55e35945c51",
        "x-requested-with": "XMLHttpRequest",
        "cookie": "geo=TW; dslang=US-EN; site=USA; aa=A7FAECFCBD580F1D570531D2FAD3C9C0; aasp=A002065E898D69A28A782A88BC949AC910C1F7BEC8E0F35AFD33FEF9E38DF04D6D2A1497EA192EB1A52E855953729DC00EE7748F1C2C85C29C2518567C8E36BC0BA2E9175770123A5B963A052539FB8F6C72DAB9463368C0C052B4F3EF360D78641DADE015A1BB45B091F70958E190B35FADA9AAB33DFC60",
        "Referer": "https://idmsa.apple.com/"
    },
    "body": "{\"accountName\":\"+12145343899\",\"rememberMe\":false}",
    "method": "POST",
    keepalive:false,
}).then(x => {
    console.log(x.status)
})