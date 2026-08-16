#!/usr/bin/env node
/**
 * סידור תיקיית העבודה, לפי החלטות עדי (16.8.2026):
 *
 * 1. **חומרי המקור יוצאים מ-`public/`.** כל קובץ ב-`public/` מוגש פומבית
 *    על ידי האתר. הספרים והמסמכים של מאסטר דונג ושון גודמן ישבו שם,
 *    ורק העובדה שהם לא מקומטים מנעה את פרסומם. מעבר ל-`sources/reference/`
 *    מסיר את הסיכון לתמיד.
 *    ✅ אומת שאין הפניה אליהם משום קובץ ב-`src/`.
 *
 * 2. **קבצי העבודה של פרויקט הרילים נכנסים ל-`.gitignore`.** ~40MB של
 *    פלט Apify וכריכות מקוריות. הכריכות שהאפליקציה משתמשת בהן כבר
 *    מקומטות בנפרד ב-`public/reel-thumbs/` - זהו עותק העבודה, לא מה
 *    שמשרת את האתר.
 *
 *   node scripts/tidy-workspace.cjs [--dry]
 */
const fs = require('fs')
const path = require('path')

const dry = process.argv.includes('--dry')
const DEST = 'sources/reference'

// --- 1. הוצאת חומרי המקור מ-public ---
// ⚠️ רשימת היתר מפורשת ולא סינון לפי סיומת. ניסיון קודם לסנן לפי סיומת
// עמד להזיז את `icon-192.png` ו-`icon-512.png` - אייקוני ה-PWA שהאפליקציה
// מגישה ושמוגדרים ב-manifest.json. כל דבר שהאתר באמת צריך נכתב כאן בשמו.
const KEEP = new Set([
  'reel-thumbs', 'images',
  'icon-192.png', 'icon-512.png', 'icon.svg', 'vite.svg',
  'manifest.json', 'sw.js', 'robots.txt', 'favicon.ico',
])

const moved = []
if (!dry) fs.mkdirSync(DEST, { recursive: true })

for (const f of fs.readdirSync('public')) {
  if (KEEP.has(f)) continue
  const full = path.join('public', f)
  if (fs.statSync(full).isDirectory()) { console.log('  ⚠️ תיקייה לא מוכרת, לא נגעתי: ' + f); continue }

  moved.push(f)
  if (!dry) fs.renameSync(full, path.join(DEST, f))
}

console.log('--- הוצאה מ-public/ ---')
for (const f of moved) console.log('  → ' + f)
if (!moved.length) console.log('  (כלום)')

// --- 2. .gitignore ---
const BLOCK = `
# --- קבצי עבודה של פרויקט הרילים (מסך "סרטוני טיפול") ---
# הפלט הגולמי של Apify + 500 הכריכות המקוריות, ~40MB.
# הכריכות שהאפליקציה מגישה מקומטות בנפרד ב-public/reel-thumbs/.
# העבודה הושלמה - 500 סרטונים באוויר. אלה שאריות ולא קוד.
reel-thumbs/
reels-full.json
reels-raw.json
reel-index.json
catalog.json
batch*.json
match-reels.cjs
download-thumbs.cjs
scm_thumb.jpg
thumb_url.txt

# חומרי מקור - מגובים בנפרד, לא בגיט (ראה sources/reference/)
sources/reference/
export/
screenshots/

# צילומי ניפוי מצינור הטלפון
probe.png
loc.png
goto-probe.png
`

let gi = fs.readFileSync('.gitignore', 'utf8')
if (gi.includes('reel-thumbs/')) {
  console.log('\n--- .gitignore כבר מעודכן ---')
} else {
  if (!dry) fs.writeFileSync('.gitignore', gi.replace(/\s*$/, '\n') + BLOCK)
  console.log('\n--- .gitignore עודכן ---')
}

console.log('')
console.log(dry ? '[יבש] לא נכתב דבר' : 'בוצע')
