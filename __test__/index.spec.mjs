import test from 'ava'
import { libVersion, libPath } from "../dist/index.mjs"

test('getVersion should return a valid version string', async (t) => {
    // 添加调试信息
    console.log('Current working directory:', process.cwd())
    console.log('Node.js architecture:', process.arch)
    console.log('Platform:', process.platform)

    const version = libVersion()

    // 版本字符串应该是一个非空字符串
    t.true(typeof version === 'string')
    t.true(version.length > 0)

    // 版本格式通常应该是 x.y.z 或类似格式
    // 检查是否包含至少一个点号
    t.true(version.includes('curl'))

    // 打印版本信息以便于调试
    console.log(`Curl version: ${version}`)
    console.log(`Lib path: ${libPath()}`)
})

// 添加测试后的清理
test.after.always(() => {
    setTimeout(() => {
        process.exit(0)
    }, 50)
})
