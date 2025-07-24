export class HttpHeaders {
    head?: string;
    headers: Map<string, string[]> = new Map();
    
    // 需要保持小写的特殊请求头
    private readonly lowercaseHeaders = new Set([
        'sec-ch-ua',
        'sec-ch-ua-mobile', 
        'sec-ch-ua-platform',
        'sec-fetch-site',
        'sec-fetch-mode',
        'sec-fetch-dest',
        'sec-fetch-user'
    ]);
    
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
                const colonIndex = header.indexOf(':');
                if (colonIndex > 0) {
                    const key = header.substring(0, colonIndex);
                    const value = header.substring(colonIndex + 1).trim();
                    this.set(key, value);
                }
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

    // 将请求头转换为合适的格式
    private normalizeKey(key: string): string {
        const lowerKey = key.toLowerCase();
        
        // 特殊的请求头保持小写
        if (this.lowercaseHeaders.has(lowerKey)) {
            return lowerKey;
        }
        
        // 其他请求头首字母大写
        return lowerKey
            .split('-')
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join('-');
    }

    set(key: string, value: string | string[]) {
        const normalizedKey = this.normalizeKey(key);
        
        if (value instanceof Array) {
            return this.headers.set(normalizedKey, value);
        }
        const arr = this.get(key) || [];
        arr.push(value);
        this.headers.set(normalizedKey, arr);
    }

    get(key: string) {
        const normalizedKey = this.normalizeKey(key);
        return this.headers.get(normalizedKey) || null;
    }

    first(key: string) {
        return this.get(key)?.[0];
    }

    delete(key: string) {
        const normalizedKey = this.normalizeKey(key);
        this.headers.delete(normalizedKey);
    }

    has(key: string) {
        const normalizedKey = this.normalizeKey(key);
        return this.headers.has(normalizedKey);
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

    toArray() {
        const arr: string[] = [];
        this.headers.forEach((values, key) => {
            arr.push(`${key}: ${values[0]}`);
        });
        return arr;
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