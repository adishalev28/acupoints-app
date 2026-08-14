const fs = require('fs')
const path = require('path')

const ROOT = require('path').resolve(__dirname, '../src/data')

// כל ה-ids שקיימים בפועל
const zoneDir = path.join(ROOT, 'zones')
const real = new Set()
for (const f of fs.readdirSync(zoneDir)) {
  const src = fs.readFileSync(path.join(zoneDir, f), 'utf8')
  for (const m of src.matchAll(/^\s*id:\s*'([^']+)'/gm)) real.add(m[1])
}

function refsIn(file, label) {
  const src = fs.readFileSync(path.join(ROOT, file), 'utf8')
  const found = new Map() // id -> context
  // pointIds: ['x','y']
  for (const m of src.matchAll(/pointIds:\s*\[([^\]]*)\]/g)) {
    for (const idm of m[1].matchAll(/'([^']+)'/g)) {
      if (!found.has(idm[1])) found.set(idm[1], label)
    }
  }
  // namedPoints / diagnosticPoints: { id: 'x'
  for (const m of src.matchAll(/\{\s*id:\s*'(\d[^']*)'/g)) {
    if (!found.has(m[1])) found.set(m[1], label)
  }
  return found
}

const files = [
  ['pathogenesis.ts', 'אבחנה מבדלת'],
  ['daoMaGroups.ts', 'קבוצות Dao Ma'],
  ['organTherapy.ts', 'פרופילי איברים'],
]

let totalBad = 0
for (const [f, label] of files) {
  const refs = refsIn(f, label)
  const bad = [...refs.keys()].filter((id) => !real.has(id))
  console.log(`\n${f}  (${label})`)
  console.log(`  הפניות: ${refs.size} | תקינות: ${refs.size - bad.length} | שבורות: ${bad.length}`)
  if (bad.length) {
    console.log(`  ❌ לא קיימות: ${bad.sort().join(', ')}`)
    totalBad += bad.length
  }
}

console.log(`\n── סה"כ נקודות בנתונים: ${real.size}`)
console.log(`── סה"כ הפניות שבורות: ${totalBad}`)
