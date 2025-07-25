import { fetch } from "../src"

fetch("https://www.google.com/complete/search?q=1&cp=1&client=gws-wiz&xssi=t&gs_pcrt=undefined&hl=zh-CN&authuser=0&psi=VZaDaLSIIte7vr0PuantkAk.1753454167460&dpr=1.25", {
    "headers": {
        "accept": "*/*",
        "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
        "downlink": "0.4",
        "priority": "u=1, i",
        "rtt": "550",
        "sec-ch-prefers-color-scheme": "dark",
        "sec-ch-ua": "\"Not)A;Brand\";v=\"8\", \"Chromium\";v=\"138\", \"Google Chrome\";v=\"138\"",
        "sec-ch-ua-arch": "\"x86\"",
        "sec-ch-ua-bitness": "\"64\"",
        "sec-ch-ua-form-factors": "\"Desktop\"",
        "sec-ch-ua-full-version": "\"138.0.7204.101\"",
        "sec-ch-ua-full-version-list": "\"Not)A;Brand\";v=\"8.0.0.0\", \"Chromium\";v=\"138.0.7204.101\", \"Google Chrome\";v=\"138.0.7204.101\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-model": "\"\"",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-ch-ua-platform-version": "\"12.0.0\"",
        "sec-ch-ua-wow64": "?0",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "cookie": "SID=g.a000zAjAvkrqDBm3mAX0gyTh3iZl92alrOPESo_pfaXBtJl3RQNCI31KSeC5XqOnBQE_DcxW5wACgYKAb0SARESFQHGX2MiHvWorbyDhowxfPjcmlBP9hoVAUF8yKoe35VZJdUvBemTnUS732o40076; __Secure-1PSID=g.a000zAjAvkrqDBm3mAX0gyTh3iZl92alrOPESo_pfaXBtJl3RQNCc6kSX8ndvOgdC9eQHMYVaAACgYKAboSARESFQHGX2MiLdqc8Jx5p7t3pPAYC1qQ4BoVAUF8yKpTD8v2n2prc7jW5E3RrzE30076; __Secure-3PSID=g.a000zAjAvkrqDBm3mAX0gyTh3iZl92alrOPESo_pfaXBtJl3RQNCgUyEquzFf45BcBFrcIR54wACgYKAa4SARESFQHGX2Mi2etOFP9d4ypotLAfrtV1-hoVAUF8yKp8QRxJJkgKjpC7TG2zsXv20076; HSID=AP_sh8djAGgMYo7Xo; SSID=Ao4oLRRKzQJxxjTRk; APISID=GDxlhaWpYTyKSh5n/ANs0iUZweO6LGpsRR; SAPISID=KAAMpGMMcea87Pkv/APzw3xtCGuGUw5LP4; __Secure-1PAPISID=KAAMpGMMcea87Pkv/APzw3xtCGuGUw5LP4; __Secure-3PAPISID=KAAMpGMMcea87Pkv/APzw3xtCGuGUw5LP4; SEARCH_SAMESITE=CgQIvp4B; AEC=AVh_V2iWURMq4tUOy5ihjlVWjx9K-QjdlrRB7pBdNWP--fVkokU998oLdg; NID=525=Mk5H-smNUQlyUx54XTN6PZ9ARYCIMxmFqJ5oGaY16-d2i6-cb9vwbJ57RfOedMFTdVuftj3NflXhSiVkyidQ7DiCbGyIUzyytgFkn6Xu6AmEesvuR4Q8IyrqBiaEJIZVKvfKMOKuQaZ6L5LVeYvOdk5xEEWyfctiAIR6MvxiBE-XcWGsi2Q1l5BZs2Chwaqor6TKPZs9PAf5q_qDF96V04pMd8yD6jNaR5VrcPITbxkGCbPdAtw08NzbdtIN8lExrJUtIUeDg-0n2EyTX5Uf-rGiXDYqani_PJnsS5R_WB9I-vK1QU0MIEBhWqr7snarYNPLPa93rB9YQKCZlSsjZQ8IpV_8cZmMdRXm_mpLTqiOLBp2XSN6pb1AqiowH-Sy2T6HtbJlkEO6S1bCEZOxSbqDSptFU1y6sgiWl4ffsj8AVTePBKMgf-ipFaGTIv_jW0p2PkvAEew6WRRef3BknwhbrFnoHoa7D4K7pCgJ4aKti79L581nSbMO-jT8WAf2lubdUmQtDEFpJvdZE0kL0QpiN0H-3OZNqwziNCs8WHcj0GXIdtUNSbVFM2TDf90w_Lm0HgoOIzRfsg4qSDQ9ln4R5Vp1aTa5f7pz0oTMrvRfXC13-DavPVYztjfqiAL32iSk5YhF61PttcR3emmSxZ66aNYSR6H-huGoxq4bKhxCRhO8_gMZOr0hzdqP9BPDg69y18e1rs5DxavZPSHIuaqUzJ1LiMvZxWTpjDtpS1SGO97Ke8FLrqVbR36fAfzYSJqsICOwm-DKq31sugf7lWE; __Secure-1PSIDTS=sidts-CjIB5H03P_JFM2AQl5wkxHcRT87CRbmecP0fcTtCS347woTLr221DhUzCWLL6mNghAkyDhAA; __Secure-3PSIDTS=sidts-CjIB5H03P_JFM2AQl5wkxHcRT87CRbmecP0fcTtCS347woTLr221DhUzCWLL6mNghAkyDhAA; SIDCC=AKEyXzXIUbfsFd01eoteM-trXdcPOVhJPPJtBNauNU44DgDm3m2bYE08uFB2Yv_8aEyzAIbWjNU; __Secure-1PSIDCC=AKEyXzVYRdtT496cJLzxweRDdP0lsYD70U742VdNaYtdavqpOLkl5zkqiD7_ITfg9Pz8bc69oBs; __Secure-3PSIDCC=AKEyXzU-KpfhSd_ZcXN6cMyY6mP0qx5TOY-z5mUC5wrmzGZHsxvF2ZK593LM8WOxVlZzkiI7sss",
        "Referer": "https://www.google.com/"
    },
    "body": null,
    "method": "GET"
}).then(res=>{
    console.log(res.text)
})