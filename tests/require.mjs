import { createRequire } from "node:module"
import { getVersion, setLibPath } from '../dist/index.mjs'
// const require = createRequire(import.meta.url)
// const { getVersion } = require('..')
setLibPath(process.cwd() + `/libs/x86_64-win32/bin/libcurl.dll`)
console.log(getVersion())