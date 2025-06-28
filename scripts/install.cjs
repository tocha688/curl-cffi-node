const fs = require("fs");
const path = require("path");
const os = require("os");
const https = require("https");
const tar = require("tar");


const homeDir = path.join(__dirname, "..", "libs");
const version = "v1.0.3";

function getDirName() {
    const archMap = {
        "x64": "x86_64",
        "arm64": "arm64",
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
    const libs = {
        "win32": "bin/libcurl.dll",
        "darwin": "libcurl-impersonate.dylib",
        "linux": "libcurl-impersonate.so",
    }
    return path.join(homeDir, name, libs[os.platform()] || "libcurl-impersonate.so");
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
                    console.log(`Redirecting to: ${response.headers.location}`);
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
    //检查文件是否存在
    const dirName = getDirName()
    const outdir = path.join(homeDir, dirName);
    if (fs.existsSync(outdir)) {
        console.log(`Directory ${outdir} already exists.`);
        return;
    }
    //下载文件
    const url = `https://github.com/lexiforest/curl-impersonate/releases/download/${version}/libcurl-impersonate-${version}.${dirName}.tar.gz`
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