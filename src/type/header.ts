export class HttpHeaders {
    head?: string;
    headers: Map<string, string[]> = new Map();
    constructor(headers?: Record<string, string> | HttpHeaders | string) {
        if (!headers) return;
        if (headers instanceof HttpHeaders) {
            this.headers = new Map(headers.headers);
            return;
        }
        // 如果是string
        if (typeof headers === 'string') {
            //格式化响应头
            headers.split('\r\n').forEach((header) => {
                const [key, value] = header.split(':');
                this.set(key, value.trim());
            });
            return;
        }
        //默认
        Object.entries(headers).forEach(([key, value]) => {
            this.set(key, value);
        });
    }

    get status() {
        const num = this.head?.match(/(?<=HTTP\/[\d\.]+\s+)(\d+)/);
        return num ? parseInt(num[0]) : 0;
    }

    set(key: string, value: string | string[]) {
        key = key.toLowerCase();
        if (value instanceof Array) {
            return this.headers.set(key.toLowerCase(), value);
        }
        const arr = this.get(key) || [];
        arr.push(value);
        this.headers.set(key.toLowerCase(), arr);
    }

    get(key: string) {
        return this.headers.get(key.toLowerCase()) || null;
    }

    first(key: string) {
        return this.get(key)?.[0];
    }

    delete(key: string) {
        this.headers.delete(key.toLowerCase());
    }

    has(key: string) {
        return this.headers.has(key.toLowerCase());
    }

    all() {
        return Object.fromEntries(this.headers);
    }

    toObject() {
        const obj: Record<string, string> = {};
        this.headers.forEach((values, key) => {
            obj[key] = values[0];
        });
        return obj;
    }

    toString() {
        return Array.from(this.headers.entries())
            .map(([key, values]) => values.map(value => `${key}: ${value}`).join('\r\n'))
            .flat()
            .join('\r\n');
    }

    clone() {
        const newHeaders = new HttpHeaders();
        this.headers.forEach((values, key) => {
            newHeaders.headers.set(key, [...values]);
        });
        return newHeaders;
    }
}

