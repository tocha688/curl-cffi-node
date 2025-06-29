import { createRequire } from "node:module"
const require = createRequire(import.meta.url)
const { getVersion } = require('..')
console.log(getVersion())