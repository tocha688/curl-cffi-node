import { socketIsReadable, socketIsWritable } from "@tocha688/libcurl";
import EventEmitter from "events";
import { clearInterval, IntervalResult, setInterval, sleep } from "../utils";

export class SocketChecker extends EventEmitter {
    private sockfds: Map<string, IntervalResult> = new Map();

    constructor() {
        super();
    }
    public checkSocket(id: string, sockfd: number): IntervalResult {
        if (this.sockfds.has(id)) {
            return this.sockfds.get(id)!;
        }

        const info = setInterval(async () => {
            if (id.startsWith("readable:") && this.sockfds.has(id)) {
                const readable = await socketIsReadable(sockfd);
                if (readable) {
                    // await sleep(500)
                    // console.log(`Socket ${id} readable: ${readable}`);
                    this.emit(id, sockfd);
                }
            } else if (id.startsWith("writable:") && this.sockfds.has(id)) {
                const writable = await socketIsWritable(sockfd);
                if (writable) {
                    // console.log(`Socket ${id} writable: ${writable}`);
                    this.emit(id, sockfd);
                }
            } else {
                console.log(`SocketChecker - checkSocket: id=${id}, sockfd=${sockfd} not found`);
                clearInterval(info);
            }
        }, 50);
        this.sockfds.set(id, info);
        return info;
    }
    private getReadId(sockfd: number): string {
        return `readable:${sockfd}`;
    }
    private getWriteId(sockfd: number): string {
        return `writable:${sockfd}`;
    }

    public addReader(sockfd: number, callback: (...args: any[]) => void): void {
        const id = this.getReadId(sockfd);
        this.on(id, callback);
        this.checkSocket(id, sockfd);
    }
    public addWriter(sockfd: number, callback: (...args: any[]) => void): void {
        const id = this.getWriteId(sockfd);
        this.on(id, callback);
        this.checkSocket(id, sockfd);
    }
    public removeReader(sockfd: number): void {
        const id = this.getReadId(sockfd);
        this.removeAllListeners(id);
        if (this.sockfds.has(id)) {
            clearInterval(this.sockfds.get(id)!);
        }
        this.sockfds.delete(id);
    }
    public removeWriter(sockfd: number): void {
        const id = this.getWriteId(sockfd);
        this.removeAllListeners(id);
        if (this.sockfds.has(id)) {
            clearInterval(this.sockfds.get(id)!);
        }
        this.sockfds.delete(id);
    }
    public hasSocket(sockfd: number): boolean {
        return this.sockfds.has(this.getReadId(sockfd)) || this.sockfds.has(this.getWriteId(sockfd));
    }
}