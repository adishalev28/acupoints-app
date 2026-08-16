/**
 * Normalize reactionAreas in all zone files
 * Format: "רמה:איבר" where רמה is one of:
 *   ראשי, עצב, מסייע, ענף, תת-ענף, הצטלבות
 * And איבר is one of:
 *   ריאה, כליה, לב, כבד, טחול, מוח, רחם, קיבה, כיס מרה, שלפוחית, שש-פו, עמוד שדרה
 *
 * Non-organ entries (anatomical areas like עיניים, פנים, ראש) stay as-is
 */

const fs = require('fs');
const path = require('path');

// Mapping: old value -> new normalized value
const NORMALIZATION_MAP = {
  // === ריאה (Lung) ===
  'ריאה-ראשי': 'ראשי:ריאה',
  'ריאה (ראשי)': 'ראשי:ריאה',

  'עצב ריאה': 'עצב:ריאה',
  'ריאה-עצב': 'עצב:ריאה',
  'עצב הריאה': 'עצב:ריאה',
  'עצב-ריאה (ענף)': 'ענף:ריאה',
  'Lung-Nerve': 'עצב:ריאה',

  'ריאה-משלים': 'מסייע:ריאה',
  'Lung-supplementary': 'מסייע:ריאה',
  'ריאה-אזורי-ענף-עוזר': 'מסייע:ריאה',

  'ענף ריאה': 'ענף:ריאה',
  'ריאה-ענף': 'ענף:ריאה',
  'ריאה (ענף)': 'ענף:ריאה',
  'Lung-branch': 'ענף:ריאה',

  'ענף משנה ריאה': 'תת-ענף:ריאה',
  'ענף משנה ריאה (Hu Wen Zhi)': 'תת-ענף:ריאה',
  'ריאה-ענף-משני': 'תת-ענף:ריאה',
  'Lung-sub-branch': 'תת-ענף:ריאה',

  'ריאה-הצטלבות': 'הצטלבות:ריאה',
  'ענף מצטלב ריאה': 'הצטלבות:ריאה',
  'ריאה-צומת': 'הצטלבות:ריאה',
  'Lung-intersection': 'הצטלבות:ריאה',

  'עצב מוטורי-ריאה': 'עצב:ריאה',

  // === כליה (Kidney) ===
  'כליה-ראשי': 'ראשי:כליה',

  'עצב כליה': 'עצב:כליה',
  'כליה-עצב': 'עצב:כליה',
  'עצב הכליה': 'עצב:כליה',
  'עצב-כליה': 'עצב:כליה',
  'עצב כליה (Hu Wen Zhi)': 'עצב:כליה',
  'עצב רגיש כליה': 'עצב:כליה',

  'כליה-משלים': 'מסייע:כליה',
  'ענף משלים כליה': 'מסייע:כליה',
  'Kidney-supplementary': 'מסייע:כליה',

  'ענף כליה': 'ענף:כליה',
  'כליה-ענף': 'ענף:כליה',
  'כליה (ענף)': 'ענף:כליה',
  'Kidney-branch': 'ענף:כליה',
  'Kidney-branch (Hu Wen Zhi adds)': 'ענף:כליה',
  'Kidney-branch (Wu Wen Zi adds)': 'ענף:כליה',

  'ענף משנה כליה': 'תת-ענף:כליה',
  'כליה-ענף-משני': 'תת-ענף:כליה',

  'כליה-צומת': 'הצטלבות:כליה',

  // === לב (Heart) ===
  'לב-ראשי': 'ראשי:לב',
  'לב (ראשי)': 'ראשי:לב',

  'עצב לב': 'עצב:לב',
  'לב-עצב': 'עצב:לב',
  'עצב הלב': 'עצב:לב',
  'עצב-לב': 'עצב:לב',
  'עצב רגיש של לב וכלי דם': 'עצב:לב',

  'לב-משלים': 'מסייע:לב',
  'ענף משלים לב': 'מסייע:לב',
  'Heart-supplementary': 'מסייע:לב',

  'ענף לב': 'ענף:לב',
  'לב-ענף': 'ענף:לב',
  'Heart-branch': 'ענף:לב',

  'ענף משנה לב': 'תת-ענף:לב',
  'לב-ענף-משני': 'תת-ענף:לב',
  'לב (תת-ענף)': 'תת-ענף:לב',
  'Heart-sub-branch': 'תת-ענף:לב',
  'ענף מצטלב לב': 'הצטלבות:לב',

  'לב-הצטלבות': 'הצטלבות:לב',
  'Heart-intersection': 'הצטלבות:לב',

  // === כבד (Liver) ===
  'כבד (ראשי)': 'ראשי:כבד',

  'עצב כבד': 'עצב:כבד',
  'כבד-עצב': 'עצב:כבד',
  'עצב הכבד': 'עצב:כבד',
  'עצב-כבד': 'עצב:כבד',

  'כבד-משלים': 'מסייע:כבד',
  'ענף משלים כבד': 'מסייע:כבד',
  'Liver-supplementary': 'מסייע:כבד',
  'Liver-auxiliary-branch': 'מסייע:כבד',

  'ענף כבד': 'ענף:כבד',
  'Liver-branch': 'ענף:כבד',

  'ענף משנה כבד': 'תת-ענף:כבד',
  'ענף משנה כבד (Hu Wen Zhi)': 'תת-ענף:כבד',
  'כבד (תת-ענף)': 'תת-ענף:כבד',
  'Liver-sub-branch (Hu Wen Zhi adds)': 'תת-ענף:כבד',

  'כבד-צומת': 'הצטלבות:כבד',
  'כבד (צומת)': 'הצטלבות:כבד',

  // === טחול (Spleen) ===
  'טחול-ראשי': 'ראשי:טחול',

  'עצב טחול': 'עצב:טחול',
  'טחול-עצב': 'עצב:טחול',
  'עצב הטחול': 'עצב:טחול',

  'ענף טחול': 'ענף:טחול',

  'טחול-צומת': 'הצטלבות:טחול',

  // === מוח (Brain) ===
  'מוח-ראשי': 'ראשי:מוח',
  'מוח-משלים': 'מסייע:מוח',

  // === רחם (Uterus) ===
  // 'רחם' stays as-is (no hierarchy level specified)

  // === קיבה (Stomach) ===
  'עצב קיבה': 'עצב:קיבה',
  'קיבה-משלים': 'מסייע:קיבה',
  'קיבה-עוזר': 'מסייע:קיבה',
  'קיבה-צומת': 'הצטלבות:קיבה',

  // === כיס מרה (Gallbladder) ===
  'עצב כיס מרה': 'עצב:כיס מרה',
  'עצב מרה': 'עצב:כיס מרה',
  'כיס מרה-עצב': 'עצב:כיס מרה',
  'כיס מרה-ראשי': 'ראשי:כיס מרה',

  // === שלפוחית (Bladder) ===
  'שלפוחית השתן-ענף': 'ענף:שלפוחית',
  'שלפוחית השתן': 'שלפוחית',
  'שלפוחית שתן': 'שלפוחית',

  // === שש-פו (Six Fu) ===
  '6 Fu': 'שש-פו',
  '6 יאנגים': 'שש-פו',
  '6 פו': 'שש-פו',
  'Six Fu': 'שש-פו',
  'Six-Fu': 'שש-פו',
  'שש-Fu': 'שש-פו',
  'שש-פו (Six-Fu)': 'שש-פו',
  'ששת הפו': 'שש-פו',
  'ששת הפו (Hu Wen Zhi)': 'שש-פו',
  'שישה פו': 'שש-פו',
  'ששת הפו-משלים': 'מסייע:שש-פו',
  'ששת הפו-עוזר': 'מסייע:שש-פו',
  'שש-פו-צומת': 'הצטלבות:שש-פו',

  // === עמוד שדרה (Spine) ===
  'Spine': 'עמוד שדרה',
  'Spine-Nerve': 'עצב:עמוד שדרה',
  'עמוד שדרה-ראשי': 'ראשי:עמוד שדרה',
  'חוט שדרה': 'עמוד שדרה',

  // === כליות (plural -> singular) ===
  'כליות': 'כליה',

  // === ריאות (plural -> singular) ===
  'ריאות': 'ריאה',

  // === מרה -> כיס מרה ===
  'מרה': 'כיס מרה',

  // === חמשת הזאנג ===
  'חמשת הזאנג (5 Zang)': 'חמשת הזאנג',

  // === Misc English ===
  'Armpit': 'בית שחי',
  'Back (Hu Wen Zhi adds)': 'גב',
  'Calf': 'שוק',
  'Cinnabar field nerve [丹田神經]': 'דאן טיאן',

  // === מוח קטן ===
  'מוח קטן (צרבלום)': 'מוח קטן',

  // === עיניים ===
  'עיניים (Hu Wen Zhi)': 'עיניים',

  // === נקודות אקסטרה ===
  'נקודות אקסטרה מחוץ לערוצים': 'נקודות אקסטרה',

  // === גרון ===
  'גרון לטרלי (בלוטת התריס)': 'גרון',
};

// Find all zone files
const zonesDir = path.join(__dirname, '..', 'src', 'data', 'zones');
const files = fs.readdirSync(zonesDir).filter(f => f.endsWith('.ts'));

let totalReplacements = 0;
let filesChanged = 0;

for (const file of files) {
  const filePath = path.join(zonesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  for (const [oldVal, newVal] of Object.entries(NORMALIZATION_MAP)) {
    // Escape special regex chars
    const escaped = oldVal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`'${escaped}'`, 'g');
    const matches = content.match(regex);
    if (matches) {
      totalReplacements += matches.length;
      content = content.replace(regex, `'${newVal}'`);
    }
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesChanged++;
    console.log(`Updated: ${file}`);
  }
}

console.log(`\nDone! ${totalReplacements} replacements in ${filesChanged} files.`);

// Verify: print remaining unique values
const allFiles = fs.readdirSync(zonesDir).filter(f => f.endsWith('.ts'));
const allValues = new Set();
for (const file of allFiles) {
  const content = fs.readFileSync(path.join(zonesDir, file), 'utf8');
  const matches = content.matchAll(/reactionAreas:\s*\[(.*?)\]/g);
  for (const m of matches) {
    const items = m[1].split(',').map(s => s.trim().replace(/'/g, '').replace(/"/g, '')).filter(Boolean);
    items.forEach(i => allValues.add(i));
  }
}

console.log(`\nRemaining unique values (${allValues.size}):`);
const sorted = [...allValues].sort();
sorted.forEach(v => console.log(`  ${v}`));
