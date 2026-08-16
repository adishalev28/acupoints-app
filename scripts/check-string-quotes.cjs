// מאתר מחרוזות additionalInfo שנסגרות מוקדם בגלל אפוסטרוף לא מוברח.
// הסימן: אחרי המחרוזת שנקראה לא מגיע פסיק/סוף שורה אלא טקסט נוסף.
const fs = require('fs');
const dir = 'src/data/zones';
let bad = 0;
for (const f of fs.readdirSync(dir)) {
  const src = fs.readFileSync(dir + '/' + f, 'utf8');
  const lines = src.split('\n');
  lines.forEach((line, idx) => {
    const m = line.match(/^(\s*)(additionalInfo: |')(.*)$/);
    if (!/additionalInfo:|^\s*'/.test(line)) return;
    // מוצאים את תחילת המחרוזת
    const start = line.indexOf("'");
    if (start < 0) return;
    let i = start + 1;
    while (i < line.length) {
      if (line[i] === '\\') { i += 2; continue; }
      if (line[i] === "'") break;
      i++;
    }
    const rest = line.slice(i + 1).trim();
    if (rest && rest !== ',' && !rest.startsWith(',')) {
      bad++;
      console.log(`⚠️  ${f}:${idx + 1}`);
      console.log(`    נסגר אחרי: ...${line.slice(Math.max(0, i - 25), i + 1)}`);
      console.log(`    נשאר: ${rest.slice(0, 70)}`);
    }
  });
}
console.log('');
console.log(bad ? `סה"כ בעיות: ${bad}` : '✅ כל המחרוזות סגורות תקין');
