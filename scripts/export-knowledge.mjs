// Export consolidated knowledge base for Gemini / NotebookLM grounding.
// Usage: npx tsx scripts/export-knowledge.mjs
// (uses tsx so it can import the TypeScript data files directly)

import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const u = (p) => pathToFileURL(resolve(root, p)).href

const { points } = await import(u('src/data/points.ts'))
const { zones } = await import(u('src/data/zones.ts'))
const { principles } = await import(u('src/data/principles.ts'))
const { daoMaClinicalGroups } = await import(u('src/data/daoMaGroups.ts'))
const { organProfiles } = await import(u('src/data/organTherapy.ts')).catch(() => ({ organProfiles: [] }))
const { pathogenesis } = await import(u('src/data/pathogenesis.ts')).catch(() => ({ pathogenesis: [] }))

const outDir = resolve(root, 'export')
mkdirSync(outDir, { recursive: true })

const sourceLabel = (s) => ({
  'tung-study': 'Master Tung (Tung Study)',
  'sean-goodman': 'Sean Goodman',
  'mccann-atlas': "McCann Atlas",
  'other': 'Other',
}[s] || s)

const flattenIndications = (ind) => {
  if (!ind?.length) return []
  if (typeof ind[0] === 'string') return ind
  return ind.flatMap((g) => [`### ${g.category}`, ...g.items.map((i) => `- ${i}`)])
}

// ───────── Markdown output (best for NotebookLM) ─────────
const md = []
md.push('# מאגר נקודות דיקור — מאסטר דונג + ד"ר טאן')
md.push('')
md.push('מקור: אפליקציית acupoints-app. הנתונים מבוססים על Master Tung Acupuncture (Tung Study) ועל ספרו של Sean Goodman.')
md.push(`סך הכל: ${points.length} נקודות, ${zones.length} אזורים, ${principles.length} עקרונות, ${daoMaClinicalGroups.length} קבוצות Dao Ma.`)
md.push('')

md.push('## אזורים אנטומיים (12 Zones)')
md.push('')
for (const z of zones) {
  md.push(`- **${z.id}** — ${z.name} (${z.nameEn})`)
}
md.push('')

md.push('## עקרונות שיטת דונג')
md.push('')
for (const p of principles) {
  md.push(`### ${p.number}. ${p.title}${p.titleEn ? ` — ${p.titleEn}` : ''}`)
  for (const s of p.sections) {
    if (s.heading) md.push(`**${s.heading}**`)
    if (s.body) md.push(s.body)
    if (s.listItems?.length) {
      for (const it of s.listItems) md.push(`- ${it}`)
    }
    md.push('')
  }
}

md.push('## קבוצות Dao Ma קליניות')
md.push('')
for (const g of daoMaClinicalGroups) {
  md.push(`### ${g.nameHebrew} (${g.namePinyin} ${g.nameChinese})`)
  md.push(`- **נקודות:** ${g.pointIds.join(', ')}`)
  md.push(`- **איבר:** ${g.organHebrew} (${g.organ})`)
  md.push(`- **חמשת השלבים:** ${g.phaseHebrew} (${g.phase})`)
  md.push(`- **מחמם משולש:** ${g.tripleWarmerHebrew}`)
  if (g.clinicalFocus?.length) md.push(`- **פוקוס קליני:** ${g.clinicalFocus.join('; ')}`)
  if (g.rootIndications?.length) md.push(`- **טיפול שורש:** ${g.rootIndications.join('; ')}`)
  if (g.branchIndications?.length) md.push(`- **טיפול ענף:** ${g.branchIndications.join('; ')}`)
  if (g.fivePhasesStrategy) md.push(`- **אסטרטגיית 5 שלבים:** ${g.fivePhasesStrategy}`)
  if (g.keyNotes) md.push(`- **הערה קלינית:** ${g.keyNotes}`)
  if (g.bookReference) md.push(`- **מקור:** ${g.bookReference}`)
  md.push('')
}

if (organProfiles?.length) {
  md.push('## פרופילי איברים (Organ Therapy)')
  md.push('')
  for (const o of organProfiles) {
    md.push(`### ${o.hebrew} — ${o.phaseHebrew}`)
    md.push(`- **רקמה:** ${o.tissue} — ${o.tissueDescription || ''}`)
    if (o.emotion) md.push(`- **רגש:** ${o.emotion}`)
    if (o.senseOrgan) md.push(`- **איבר חישה:** ${o.senseOrgan}`)
    if (o.primaryDaoMa?.length) md.push(`- **קבוצות Dao Ma מרכזיות:** ${o.primaryDaoMa.join(', ')}`)
    if (o.motherOrgan) md.push(`- **אם (מזינה):** ${o.motherOrgan}`)
    md.push('')
  }
}

md.push('## נקודות דיקור — מפורט')
md.push('')

// Group points by zone for readability
const byZone = new Map()
for (const p of points) {
  if (!byZone.has(p.zone)) byZone.set(p.zone, [])
  byZone.get(p.zone).push(p)
}

for (const z of zones) {
  const list = byZone.get(z.id) || []
  if (!list.length) continue
  md.push(`### אזור ${z.id} — ${z.name} (${z.nameEn}) — ${list.length} נקודות`)
  md.push('')
  for (const p of list) {
    md.push(`#### ${p.id} — ${p.hebrewName} | ${p.pinyinName} ${p.chineseName} | ${p.englishName}`)
    md.push(`- **אזור:** ${z.name} (${z.id})`)
    md.push(`- **מיקום:** ${p.location || '—'}`)
    md.push(`- **דיקור:** ${p.needling || '—'}`)
    if (p.reactionAreas?.length) md.push(`- **אזורי תגובה:** ${p.reactionAreas.join(', ')}`)
    if (p.daoMaGroup) md.push(`- **קבוצת Dao Ma:** ${p.daoMaGroup}`)
    if (p.absoluteNeedle) md.push(`- **מחט מוחלטת:** ${p.absoluteNeedle}`)
    if (p.sources?.length) md.push(`- **מקורות:** ${p.sources.map((s) => sourceLabel(s.source)).join(', ')}`)
    md.push('')
    md.push('**אינדיקציות:**')
    const indLines = flattenIndications(p.indications)
    if (indLines.length === 0) {
      md.push('—')
    } else {
      for (const line of indLines) {
        md.push(line.startsWith('#') || line.startsWith('-') ? line : `- ${line}`)
      }
    }
    md.push('')
    if (p.additionalInfo) {
      md.push('**הערות נוספות:**')
      md.push(p.additionalInfo)
      md.push('')
    }
    md.push('---')
    md.push('')
  }
}

writeFileSync(resolve(outDir, 'acupoints-knowledge.md'), md.join('\n'), 'utf8')

// ───────── JSON output (structured backup) ─────────
const json = {
  meta: {
    exportedAt: new Date().toISOString(),
    totalPoints: points.length,
    totalZones: zones.length,
    totalPrinciples: principles.length,
    totalDaoMaGroups: daoMaClinicalGroups.length,
  },
  zones,
  principles,
  daoMaClinicalGroups,
  organProfiles: organProfiles || [],
  pathogenesis: pathogenesis || [],
  points,
}
writeFileSync(resolve(outDir, 'acupoints-knowledge.json'), JSON.stringify(json, null, 2), 'utf8')

console.log(`✓ Exported ${points.length} points`)
console.log(`  - ${resolve(outDir, 'acupoints-knowledge.md')}`)
console.log(`  - ${resolve(outDir, 'acupoints-knowledge.json')}`)
