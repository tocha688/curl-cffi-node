import { CookieJar } from "tough-cookie";
import { CurlResponse, RequestOptions } from "../type";
import { Curl, storageCurls } from "..";
import { CurlClient } from "./client";

type CurlInfo = {
    curl: Curl;
    lastTime: number;
}

export class CurlSession extends CurlClient {
    constructor(ops?: RequestOptions) {
        super({
            ...ops,
            jar: ops?.jar ?? new CookieJar(),
        });

        //开启检查1分钟没有操作就自动关闭curl
        this.startCheckCurlClose();

        storageCurls.add(this);
    }
    private curlCheckTimer?: NodeJS.Timeout;
    private startCheckCurlClose(){
        this.curlCheckTimer = setInterval(() => {
            const now = Date.now();
            this.curls = this.curls.filter(info => {
                if (now - info.lastTime > 60 * 1000) {
                    info.curl.close();
                    return false;
                }
                return true;
            });
        }, 60 * 1000);
        this.curlCheckTimer.unref();
    }
    private curls: Array<CurlInfo> = [];
    override getCurl(): Curl {
        let info = this.curls.shift()
        if (info) {
            info.curl.reset();
        }
        return info?.curl ?? new Curl();
    }

    override close() {
        this.curls.forEach(info => info.curl.close());
        this.curls = [];
        this.curlCheckTimer && clearInterval(this.curlCheckTimer);
        this.curlCheckTimer = undefined;
        super.close();
        storageCurls.delete(this);
    }

    override async beforeResponse(options: RequestOptions, curl: Curl, res: CurlResponse): Promise<CurlResponse> {
        this.curls.push({
            curl,
            lastTime: Date.now()
        });
        // curl.close();
        return res;
    }

}

