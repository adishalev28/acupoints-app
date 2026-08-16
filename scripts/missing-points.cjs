#!/usr/bin/env node
/**
 * אילו נקודות קיימות במקורות שנלכדו מהאפליקציה של שון ואינן במאגר שלנו.
 *
 * הרקע: בכל אזור שנסרק עד הסוף נמצאה לפחות נקודה אחת חסרה. הבדיקה הזו
 * הופכת את זה משאלה של מזל לבדיקה שיטתית.
 *
 * ⚠️ מכסה רק מה שכבר נלכד ל-`sources/app-indications/`. נקודות שהצינור
 * מעולם לא עבר עליהן לא יופיעו כאן - לזה צריך מעבר בחצים על האפליקציה.
 *
 *   node scripts/missing-points.cjs
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const SRC = path.join(ROOT, 'sources/app-indications')
const ZONES = path.join(ROOT, 'src/data/zones')

const ours = new Set()
for (const f of fs.readdirSync(ZONES)) {
  const src = fs.readFileSync(path.join(ZONES, f), 'utf8')
  for (const m of src.matchAll(/\n\s*id:\s*'([^']+)'/g)) ours.add(m[1])
}

const missing = []
let scanned = 0
for (const f of fs.readdirSync(SRC)) {
  if (!f.endsWith('.json')) continue // התיקייה מכילה גם `_enrichment-progress.md`
  const j = JSON.parse(fs.readFileSync(path.join(SRC, f), 'utf8'))
  for (const [k, v] of Object.entries(j)) {
    if (k.startsWith('_')) continue
    scanned++
    if (!ours.has(k)) missing.push({ id: k, file: f, header: v.header || '', pending: f.startsWith('_') })
  }
}

console.log('נקודות שקיימות במקורות שנלכדו ואינן במאגר')
console.log('='.repeat(64))
for (const m of missing) {
  const tag = m.pending ? '⏳' : '🚨'
  console.log(`  ${tag} ${m.id.padEnd(18)}${m.header.slice(0, 40).padEnd(42)}${m.file}`)
}
console.log('')
console.log(`${missing.length} חסרות מתוך ${scanned} שנלכדו · ${ours.size} נקודות במאגר`)
console.log('⏳ = כבר מתועדת כממתינה   🚨 = חדשה')
