// Stamps the service worker with a build timestamp so the browser
// detects a new version on each deploy and auto-updates the cache.
import { readFileSync, writeFileSync } from 'fs'

const swPath = 'dist/sw.js'
const timestamp = Date.now().toString()

let content = readFileSync(swPath, 'utf-8')
content = content.replace('__BUILD_TIME__', timestamp)
writeFileSync(swPath, content)

console.log(`✅ Service Worker stamped with build version: ${timestamp}`)
