export enum LogLevel {
    none = 0,
    error = 1,
    info = 2,
    warn = 3,
    debug = 4,
}

export class Logger {
    static level: LogLevel = LogLevel.none;
    private constructor() { }
    private static time() {
        return new Date().toISOString().replace('T', ' ').replace('Z', '');
    }

    static info(...args: any[]) {
        if (this.level >= LogLevel.info) {
            console.log(this.time(), ...args);
        }
    }

    static debug(...args: any[]) {
        if (this.level >= LogLevel.debug) {
            console.log(this.time(), ...args);
        }
    }

    static warn(...args: any[]) {
        if (this.level >= LogLevel.warn) {
            console.warn(this.time(), ...args);
        }
    }

    static error(...args: any[]) {
        if (this.level >= LogLevel.error) {
            console.log(this.time(), ...args);
        }
    }
}