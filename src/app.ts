import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from "url";

const currentDir = (() => {
    if (typeof __dirname !== "undefined") {
        return __dirname; // CommonJS
    }
    //@ts-ignore
    return path.dirname(fileURLToPath(eval(`import.meta.url`))); // ESM
})();

export const libsPath = path.join(currentDir, "..", 'libs');
export const certPath = path.join(libsPath, "cacert.pem");

export function getDirName() {
    const archMap: Record<string, string> = {
        "x64": "x86_64",
        "arm64": "arm64",
        "arm": "arm-linux-gnueabihf",
        "riscv64": "riscv64",
        "i386": "i386",
        "ia32": "i686"
    };

    const platformMap: Record<string, string> = {
        "linux": "linux-gnu",
        "darwin": "macos",
        "win32": "win32"
    };
    const arch = archMap[os.arch()] || os.arch();
    const platform = platformMap[os.platform()] || os.platform();

    return `${arch}-${platform}`;
}

export function getLibPath() {
    const name = getDirName();
    const libs: Record<string, string> = {
        "win32": "bin/libcurl.dll",
        "darwin": "libcurl-impersonate.dylib",
        "linux": "libcurl-impersonate.so",
    }
    return path.join(libsPath, name, libs[os.platform()] || "libcurl-impersonate.so");
}