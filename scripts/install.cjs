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
        "win32": "bin/libcurl-impersonate.dll",
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
    const runtimeName = getDirName();

    // 获取所有 releases
    const releases = await fetch(`https://api.github.com/repos/lexiforest/curl-impersonate/releases`, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
        }
    }).then(x => x.json());

    if (!Array.isArray(releases) || releases.length === 0) {
        throw new Error("Failed to fetch releases from GitHub API.");
    }

    // 在 release 的 assets 中查找当前平台的包
    function findAssetInRelease(release) {
        return release?.assets?.find(x =>
            x.name.startsWith("libcurl-impersonate-") && x.name.endsWith(`${runtimeName}.tar.gz`)
        );
    }

    let url = null;
    let actualVersion = null;

    // 从最新版本往回找，找到第一个有当前平台包的版本
    for (const release of releases) {
        if (release.prerelease || release.draft) continue;
        const asset = findAssetInRelease(release);
        if (asset) {
            url = asset.browser_download_url;
            actualVersion = release.tag_name;
            console.log(`Found ${runtimeName} package in version ${actualVersion}.`);
            break;
        }
        console.log(`Version ${release.tag_name} does not have a ${runtimeName} package, trying older version...`);
    }

    if (!url || !actualVersion) {
        throw new Error(`No release found with a ${runtimeName} package. Please check https://github.com/lexiforest/curl-impersonate/releases`);
    }

    // 检查是否已下载过该版本
    const actualOutdir = path.join(homeDir, `${runtimeName}_${actualVersion}`);
    if (fs.existsSync(actualOutdir)) {
        console.log(`Directory ${actualOutdir} already exists.`);
        // 仍需更新配置文件以指向实际存在的版本
        if (actualVersion !== version) {
            updateConfig(actualVersion);
        }
        return;
    }

    console.log(`Downloading from ${url}`);
    const tarPath = await downloadFile(url, homeDir);

    // 解压缩
    fs.mkdirSync(actualOutdir, { recursive: true });
    console.log(`Extracting to ${actualOutdir}`);
    await tar.x({
        file: tarPath,
        cwd: actualOutdir,
    });
    fs.unlinkSync(tarPath);
    console.log(`Extraction complete.`);

    // 更新配置文件为实际下载的版本
    if (actualVersion !== version) {
        updateConfig(actualVersion);
    }
}

function updateConfig(newVersion) {
    const configPath = path.join(__dirname, "..", "libcurl.config.json");
    const newConfig = JSON.stringify({ version: newVersion }, null, 2) + "\n";
    fs.writeFileSync(configPath, newConfig, "utf-8");
    console.log(`Updated libcurl.config.json to version ${newVersion}.`);
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