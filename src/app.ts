import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';

// 全局缓存目录，安装脚本会将依赖下载到这里：~/.curl-cffi/libs
export const globalLibsPath = path.join(os.homedir(), ".curl-cffi", "libs");
// 证书只使用全局目录中的文件
export const certPath = path.join(globalLibsPath, "cacert.pem");

export function getDirName() {
    const archMap: Record<string, string> = {
        "x64": "x86_64",
        "arm64": os.platform() == "linux" ? "aarch64" : "arm64",
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
    };
    const candidates = libs[os.platform()] || [];

    if (!fs.existsSync(globalLibsPath)) {
        throw new Error(`Global libs directory not found: ${globalLibsPath}. Please run scripts/install.cjs first.`);
    }

    // 从 libcurl.config.json 读取推荐版本，如果存在则精准匹配该版本目录
    let preferredVersion: string | null = null;
    try {
        const cfg = require(path.join(__dirname, "..", "libcurl.config.json"));
        preferredVersion = cfg?.version ?? null;
    } catch { /* ignore */ }

    const dirs = fs.readdirSync(globalLibsPath, { withFileTypes: true })
        .filter(d => d.isDirectory() && d.name.startsWith(name + "_"));

    if (preferredVersion) {
        const expectDir = `${name}_${preferredVersion}`; // 如 x86_64-win32_v1.1.2
        const hit = dirs.find(d => d.name === expectDir);
        if (!hit) {
            throw new Error(`Configured version='${preferredVersion}' in libcurl.config.json not found under ${globalLibsPath}. Please run scripts/install.cjs to download this version.`);
        }
        for (const lib of candidates) {
            const p = path.join(globalLibsPath, hit.name, lib);
            if (fs.existsSync(p)) return p;
        }
        throw new Error(`Lib file not found in ${path.join(globalLibsPath, hit.name)} for platform ${os.platform()}.`);
    }

    // 若未配置版本，按版本降序选择最新
    function parseVer(s: string): number[] {
        const part = s.substring(s.indexOf("_") + 1).replace(/^v/i, "");
        return part.split(".").map(x => parseInt(x, 10) || 0);
    }
    function cmpDesc(a: string, b: string): number {
        const va = parseVer(a), vb = parseVer(b);
        for (let i = 0; i < Math.max(va.length, vb.length); i++) {
            const ai = va[i] || 0, bi = vb[i] || 0;
            if (ai !== bi) return bi - ai; // 降序
        }
        return 0;
    }
    const sorted = dirs.map(d => d.name).sort(cmpDesc);
    for (const dn of sorted) {
        for (const lib of candidates) {
            const p = path.join(globalLibsPath, dn, lib);
            if (fs.existsSync(p)) return p;
        }
    }
    throw new Error(`libcurl not found under ${globalLibsPath}; please run scripts/install.cjs.`);
}