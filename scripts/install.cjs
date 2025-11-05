const fs = require("fs");
const path = require("path");
const os = require("os");
const https = require("https");
const tar = require("tar");


// 使用全局目录缓存依赖，避免每个项目重复下载
// Windows/Linux/macOS 都统一放在用户主目录下的 .curl-cffi/libs 目录
// const homeDir = path.join(os.homedir(), ".curl-cffi", "libs");
const homeDir = path.join(__dirname, "..", "libs");
// 从独立 JSON 配置文件读取 libcurl 版本，避免 ESM/CJS 差异
const config = require(path.join(__dirname, "..", "libcurl.config.json"));
const version = config?.version;
if (!version) {
    throw new Error("libcurl.version not found in libcurl.config.json. Please set { \"version\": \"vX.Y.Z\" }.");
}

function getDirName() {
    const archMap = {
        "x64": "x86_64",
        "arm64": os.platform() == "linux" ? "aarch64" : "arm64",
        "arm": "arm-linux-gnueabihf",
        "riscv64": "riscv64",
        "i386": "i386",
        "ia32": "i686"
    };

    const platformMap = {
        "linux": "linux-gnu",
        "darwin": "macos",
        "win32": "win32"
    };
    const arch = archMap[os.arch()] || os.arch();
    const platform = platformMap[os.platform()] || os.platform();

    return `${arch}-${platform}`;
}

function getLibPath() {
    const name = getDirName();
    const storeName = `${name}_${version}`; // 如 x86_64-win32_v1.1.2
    const libs = {
        "win32": "bin/libcurl.dll",
        "darwin": "libcurl-impersonate.dylib",
        "linux": "libcurl-impersonate.so",
    };
    const preferred = path.join(homeDir, storeName, libs[os.platform()] || "libcurl-impersonate.so");
    return preferred;
}

async function downloadFile(url, outdir) {
    const filePath = path.join(outdir, path.basename(url));

    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filePath);
        function requestFile(url) {
            https.get(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
                    "Accept": "application/octet-stream"
                }
            }, (response) => {
                if (response.statusCode === 302 && response.headers.location) {
                    // console.log(`Redirecting to: ${response.headers.location}`);
                    requestFile(response.headers.location); // 重新请求新地址
                    return;
                }

                if (response.statusCode !== 200) {
                    reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
                    return;
                }

                response.pipe(file);
                file.on("finish", () => {
                    file.close(() => resolve(filePath));
                });
            }).on("error", (err) => {
                fs.unlink(filePath, () => reject(err));
            });
        }
        requestFile(url);
    });
}

async function loadLibs() {
    // 检查文件是否存在（使用版本化目录名 x86_64-win32_版本号）
    const runtimeName = getDirName();
    const outdir = path.join(homeDir, `${runtimeName}_${version}`);
    if (fs.existsSync(outdir)) {
        console.log(`Directory ${outdir} already exists.`);
        return;
    }
    //下载文件
    const releases = await fetch(`https://api.github.com/repos/lexiforest/curl-impersonate/releases`, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
        }
    }).then(x => x.json());
    // console.log(JSON.stringify(releases, null, 2));
    const target = releases?.[0]?.assets?.find(x => x.name.startsWith("libcurl-impersonate-") && x.name.endsWith(`${runtimeName}.tar.gz`));
    let url = target?.browser_download_url;
    if (!url) {
        url = `https://github.com/lexiforest/curl-impersonate/releases/download/${version}/libcurl-impersonate-${version}.${runtimeName}.tar.gz`
    }
    console.log(`Downloading from ${url}`);
    const tarPath = await downloadFile(url, homeDir);
    //解压缩
    fs.mkdirSync(outdir, { recursive: true });
    console.log(`Extracting to ${outdir}`);
    await tar.x({
        file: tarPath,
        cwd: outdir,
    });
    fs.unlinkSync(tarPath);
    console.log(`Extraction complete.`);
}

async function loadCert() {
    console.log("Downloading CA certificates...");
    await downloadFile("https://curl.se/ca/cacert.pem", homeDir);
    console.log("CA certificates downloaded.");
}

async function main() {
    fs.mkdirSync(homeDir, { recursive: true });
    await Promise.all([
        loadLibs(),
        loadCert()
    ])
}

//判断是不是入口
if (require.main === module) {
    main();
    console.log(getLibPath());
}

module.exports = {
    getLibPath,
    getDirName,
    homeDir,
    version
};