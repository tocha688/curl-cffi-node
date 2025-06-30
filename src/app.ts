import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';

export const libsPath = path.join(__dirname, "..", 'libs');
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
    const libs: Record<string, string[]> = {
        "win32": ["bin/libcurl.dll"],
        "darwin": ["libcurl-impersonate.4.dylib", "libcurl-impersonate.dylib"],
        "linux": ["libcurl-impersonate.so"],
    }
    for (let lib of libs[os.platform()] || []) {
        const libpath = path.join(libsPath, name, lib);
        if (fs.existsSync(libpath)) {
            return libpath;
        }
    }
    // console.error(`libcurl not found for platform ${os.platform()} and arch ${os.arch()}`);
    console.error(`Expected path: ${path.join(libsPath, name)}`);
    throw new Error(`libcurl not found for platform ${os.platform()} and arch ${os.arch()}`);
}