#!/usr/bin/env node
/**
 * קליטת תוצאות התפירה אל תוך הריפו.
 *
 * עושה שני דברים, שניהם הפיכים ובלי לגעת בנתונים הקליניים:
 *   1. שומר את המקור האנגלי כפי שהוא ב-sources/app-indications/<zone>.json
 *      — שכבת ייחוס. בלעדיה אי אפשר לבדוק אחורה מאיפה הגיעה טענה.
 *   2. ממזג את ספירת הכרטיסים אל scripts/dong-cards.json,
 *      שממנו apply-dong-cards.cjs ממלא את dongIndications.
 *
 * מדפיס גם דוח הצלבה מול הנתונים בעברית לפני שנוגעים במשהו.
 *
 *   node scripts/phone-capture/ingest.cjs points.json           # דוח בלבד
 *   node scripts/phone-capture/ingest.cjs points.json --write
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const ZONES = path.join(ROOT, 'src/data/zones');
const CARDS = path.join(ROOT, 'scripts/dong-cards.json');
const SRCDIR = path.join(ROOT, 'sources/app-indications');

const input = process.argv[2];
const WRITE = process.argv.includes('--write');
if (!input) {
  console.error('שימוש: node ingest.cjs <points.json> [--write]');
  process.exit(1);
}

const points = JSON.parse(fs.readFileSync(input, 'utf8'));

// --- הנתונים בעברית, לצורך ההצלבה ---
const hebrew = new Map();
for (const f of fs.readdirSync(ZONES)) {
  const src = fs.readFileSync(path.join(ZONES, f), 'utf8');
  for (const block of src.matchAll(/\r?\n {2}\{\r?\n(?:.|\n|\r)*?\r?\n {2}\},/g)) {
    const b = block[0];
    const id = (b.match(/id: '([^']+)'/) || [])[1];
    if (!id) continue;
    const ind = b.match(/\r?\n {4}indications: \[((?:.|\n|\r)*?)\r?\n {4}\],/);
    const items = ind ? [...ind[1].matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((m) => m[1]) : [];
    const info = (b.match(/\r?\n {4}additionalInfo: '((?:[^'\\]|\\.)*)'/) || [])[1] || '';
    hebrew.set(id, { file: f, items, info, hasDong: /dongIndications:/.test(b) });
  }
}

// --- דוח ---
const rows = [];
for (const [id, rec] of Object.entries(points)) {
  const he = hebrew.get(id);
  rows.push({
    id,
    app: rec.cardCount,
    he: he ? he.items.length : null,
    match: he ? he.items.length === rec.cardCount : false,
    hasDong: he ? he.hasDong : false,
    infoHe: he ? he.info.length : 0,
    infoApp: rec.additionalInfo.length,
    shots: rec.shots,
  });
}
rows.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

const pad = (s, n) => String(s).padEnd(n);
console.log(pad('נקודה', 12) + pad('אפליקציה', 10) + pad('עברית', 8) + pad('תואם', 7) + pad('dong', 7) + 'additionalInfo (עברית → אפליקציה)');
console.log('-'.repeat(88));
for (const r of rows) {
  const flag = r.he === null ? '❓ חסר' : r.match ? '✅' : '⚠️';
  const grow = r.infoApp > r.infoHe * 1.25 ? '  ← יש להעשיר' : '';
  console.log(
    pad(r.id, 12) + pad(r.app, 10) + pad(r.he ?? '-', 8) + pad(flag, 7) +
    pad(r.hasDong ? 'יש' : '-', 7) + `${r.infoHe} → ${r.infoApp}${grow}`
  );
}

const matched = rows.filter((r) => r.match).length;
const missing = rows.filter((r) => r.he === null);
console.log(`\nסה"כ ${rows.length} נקודות · ${matched} ספירה תואמת · ${rows.length - matched} לבדיקה ידנית`);
if (missing.length) console.log(`❓ לא נמצאו בנתונים: ${missing.map((r) => r.id).join(', ')}`);

// --- כתיבה ---
if (!WRITE) {
  console.log('\n(dry run — הרץ עם --write לכתיבה)');
  process.exit(0);
}

fs.mkdirSync(SRCDIR, { recursive: true });
const byZone = new Map();
for (const [id, rec] of Object.entries(points)) {
  const zone = id.split('.')[0];
  if (!byZone.has(zone)) byZone.set(zone, {});
  byZone.get(zone)[id] = {
    dongIndications: rec.dongIndications,
    indications: rec.indications,
    additionalInfo: rec.additionalInfo,
  };
}
for (const [zone, data] of byZone) {
  const file = path.join(SRCDIR, `zone${zone}.json`);
  const existing = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
  const merged = {
    _comment:
      'חילוץ מילולי מטאב Indications באפליקציה של שון גודמן, דרך OCR של צילומי מסך. ' +
      'הכרטיס הראשון = ההתוויות של מאסטר דונג. זהו מקור, לא נתוני התצוגה — אין לערוך ידנית.',
    _tool: 'scripts/phone-capture/{capture-batch.ps1,cards.ps1,stitch.cjs}',
    ...existing,
    ...data,
  };
  fs.writeFileSync(file, JSON.stringify(merged, null, 2) + '\n');
  console.log(`✅ ${path.relative(ROOT, file)} — ${Object.keys(data).length} נקודות`);
}

const cardsFile = JSON.parse(fs.readFileSync(CARDS, 'utf8'));
let added = 0;
for (const [id, rec] of Object.entries(points)) {
  if (cardsFile.cards[id] !== rec.cardCount) added++;
  cardsFile.cards[id] = rec.cardCount;
}
fs.writeFileSync(CARDS, JSON.stringify(cardsFile, null, 2) + '\n');
console.log(`✅ scripts/dong-cards.json — ${added} ספירות חדשות/מעודכנות`);
console.log('\nהשלב הבא: node scripts/apply-dong-cards.cjs');
