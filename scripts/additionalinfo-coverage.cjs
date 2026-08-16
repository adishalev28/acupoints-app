#!/usr/bin/env node
/**
 * כיסוי `additionalInfo`: היכן הטקסט הקליני שלנו דל מול המקור האנגלי.
 *
 * משלים את `enrichment-triage.cjs`, שבודק **עוגנים** (שמות מטפלים,
 * כותרות מקטעים). הכלי הזה תופס את המקרה ההפוך: אין עוגן במקור, אבל
 * יש בו פסקה משמעותית ואצלנו כמעט כלום.
 *
 * ספירת תווים אינה מדד טוב לפער כללי (עברית דחוסה מאנגלית), ולכן הסף
 * כאן מכוון: עברית קצרה מ-120 תווים מול מקור ארוך מ-400.
 *
 *   node scripts/additionalinfo-coverage.cjs
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const app = {}
for (const f of fs.readdirSync(path.join(ROOT, 'sources/app-indications'))) {
  if (f.startsWith('_')) continue
  const j = JSON.parse(fs.readFileSync(path.join(ROOT, 'sources/app-indications', f), 'utf8'))
  for (const [k, v] of Object.entries(j)) if (!k.startsWith('_')) app[k] = v
}

const rows = []
let total = 0
const ZONES = path.join(ROOT, 'src/data/zones')
for (const f of fs.readdirSync(ZONES)) {
  const src = fs.readFileSync(path.join(ZONES, f), 'utf8')
  for (const blk of src.split(/(?=\n\s*\{\s*\n\s*id:\s*')/)) {
    const m = blk.match(/id:\s*'([^']+)'/)
    if (!m || !app[m[1]]) continue
    total++
    const mm = blk.match(/additionalInfo:\s*\n?\s*'((?:[^'\\]|\\.)*)'/)
    const he = (mm ? mm[1] : '').trim()
    const en = (app[m[1]].additionalInfo || '').trim()
    if (he.length < 120 && en.length > 400) rows.push({ id: m[1], file: f, he: he.length, en: en.length })
  }
}

rows.sort((a, b) => b.en - a.en)
console.log('נקודות עם `additionalInfo` דל מול מקור משמעותי')
console.log('='.repeat(60))
for (const r of rows) {
  console.log('  ' + r.id.padEnd(14) + r.file.padEnd(18) + 'עברית ' + String(r.he).padStart(4) + '   אנגלית ' + r.en)
}
console.log('')
console.log(rows.length + ' מתוך ' + total + ' נקודות מושוות')
