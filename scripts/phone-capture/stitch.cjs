#!/usr/bin/env node
// תפירת צילומי הגלילה של נקודה אחת לרשומה אחת רציפה.
//
// כל צילום חופף לקודם. התפירה מוצאת את הסיומת הארוכה ביותר של מה שנצבר
// שמתאימה לתחילת הצילום החדש, ומוסיפה רק את מה שמעבר לה.
//
//   node stitch.cjs shots.json > points.json
//
// קלט: הפלט של cards.ps1 (מערך צילומים, לפי סדר הגלילה)
// פלט: { "77.01": { dongIndications: [...], indications: [...], additionalInfo: "..." } }

const fs = require('fs');

// כל תו שאינו אות/ספרה יורד לגמרי — ה-OCR לא עקבי ברווחים ("CTS" מול "CT S")
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '');

// דמיון לפי מרחק עריכה, כדי לספוג שגיאות OCR ("spine" מול "soine")
function similar(a, b) {
  if (a === b) return true;
  const n = a.length, m = b.length;
  if (!n || !m) return false;
  if (Math.abs(n - m) / Math.max(n, m) > 0.15) return false;
  let prev = Array.from({ length: m + 1 }, (_, j) => j);
  for (let i = 1; i <= n; i++) {
    const cur = [i];
    for (let j = 1; j <= m; j++) {
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    prev = cur;
  }
  return 1 - prev[m] / Math.max(n, m) >= 0.88;
}

// שורות שהאפליקציה מציגה תמיד ואינן תוכן
const CHROME = [
  /^your note$/i,
  /^you haven'?t added any note yet$/i,
  /^add a note$/i,
  /^indications$/i,
];
const isChrome = (t) => CHROME.some((re) => re.test(t.trim()));

function stitch(shots) {
  // כל שורה מיוצגת כ-{ text, card, shot } — הכרטיסים ממוספרים מחדש גלובלית
  let acc = [];

  for (const shot of shots) {
    const incoming = shot.lines
      .filter((l) => l.text.trim() && !isChrome(l.text) && !l.clipped)
      .map((l) => ({ text: l.text.trim(), card: l.card }));
    if (!incoming.length) continue;

    if (!acc.length) {
      acc = incoming.map((l) => ({ ...l, gcard: l.card }));
      continue;
    }

    // חיפוש החפיפה: הסיומת הארוכה ביותר של acc == הרישא של incoming
    let overlap = 0;
    const max = Math.min(acc.length, incoming.length);
    for (let n = max; n >= 1; n--) {
      const tail = acc.slice(acc.length - n).map((l) => norm(l.text));
      const head = incoming.slice(0, n).map((l) => norm(l.text));
      if (tail.every((t, i) => similar(t, head[i]))) { overlap = n; break; }
    }

    if (overlap === 0) {
      // אין חפיפה. לפני שמסמנים פער — ייתכן שהגלילה לא זזה בכלל
      // ורק ה-OCR השתנה. מסננים כל שורה שכבר ראינו, כדי לא לשכפל.
      const seenAll = acc.map((l) => norm(l.text));
      const fresh = incoming.filter((l) => !seenAll.some((s) => similar(s, norm(l.text))));
      if (fresh.length === incoming.length) acc.push({ text: '⚠️ GAP', card: 0, gcard: 0 });
      incoming.length = 0;
      incoming.push(...fresh);
      if (!incoming.length) continue;
    }

    // מיפוי מספרי הכרטיס המקומיים של הצילום החדש למספור הגלובלי
    const shift = (() => {
      if (!overlap) return null;
      const a = acc[acc.length - overlap];
      const b = incoming[0];
      return a.card && b.card ? a.gcard - b.card : null;
    })();

    let nextG = Math.max(0, ...acc.map((l) => l.gcard)) + 1;
    const seen = new Map();
    for (const l of incoming.slice(overlap)) {
      let g = 0;
      if (l.card) {
        if (shift !== null) {
          g = l.card + shift;
        } else if (seen.has(l.card)) {
          g = seen.get(l.card);
        } else {
          g = nextG++;
          seen.set(l.card, g);
        }
      }
      acc.push({ ...l, gcard: g });
    }
  }
  return acc;
}

function toRecord(lines) {
  const cards = new Map();
  const prose = [];
  let inProse = false;

  for (const l of lines) {
    if (/^additional\s*information$/i.test(l.text.trim())) { inProse = true; continue; }
    // הטקסט החופשי מתחיל רק אחרי הכותרת. מה שלפניה ומחוץ לכרטיס
    // הוא ווידג׳ט ההערות של האפליקציה — לא תוכן.
    if (inProse) { prose.push(l.text); continue; }
    if (l.gcard) {
      cards.set(l.gcard, (cards.get(l.gcard) ? cards.get(l.gcard) + ' ' : '') + l.text);
    }
  }

  const ordered = [...cards.entries()].sort((a, b) => a[0] - b[0]).map(([, t]) => t);
  return {
    dongIndications: ordered.length ? splitList(ordered[0]) : [],
    indications: ordered.slice(1),
    cardCount: ordered.length,
    additionalInfo: prose.join(' ').replace(/\s+/g, ' ').trim(),
  };
}

// הכרטיס הראשון הוא רשימה מופרדת בפסיקים של ההתוויות של דונג עצמו.
// פסיק בתוך סוגריים הוא חלק מההסבר ולא מפריד — פיצול עליו שובר התוויות
// כמו "myocardial infarction (chest pressure, restlessness at rest)".
function splitList(text) {
  const out = [];
  let depth = 0;
  let cur = '';
  for (const ch of text.replace(/\.$/, '')) {
    if (ch === '(' || ch === '[') depth++;
    else if (ch === ')' || ch === ']') depth = Math.max(0, depth - 1);
    if (ch === ',' && depth === 0) { out.push(cur); cur = ''; continue; }
    cur += ch;
  }
  out.push(cur);
  // ה-OCR משמיט לפעמים סוגר סוגר. אם הספירה לא מתאזנת אי אפשר לסמוך
  // על העומק, ופיצול פשוט עדיף על בליעת חצי מהרשימה.
  if (depth !== 0) return text.replace(/\.$/, '').split(/,\s*/).map((s) => s.trim()).filter(Boolean);
  return out.map((s) => s.trim()).filter(Boolean);
}

const shots = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));

// קיבוץ לפי תווית הצילום (החלק שלפני הקו התחתון) ולא לפי ה-OCR של הכותרת:
// הלכידה יודעת בוודאות אילו צילומים שייכים לאותה נקודה, ו-OCR עלול להיכשל בשורה בודדת.
const byLabel = new Map();
for (const s of shots) {
  const label = s.file.replace(/_\d+\.png$/i, '');
  if (!byLabel.has(label)) byLabel.set(label, []);
  byLabel.get(label).push(s);
}

const out = {};
for (const [label, group] of byLabel) {
  group.sort((a, b) => a.file.localeCompare(b.file, undefined, { numeric: true }));

  // מזהה הנקודה = הקריאה הנפוצה ביותר מהכותרת הדביקה
  const votes = new Map();
  for (const s of group) if (s.point) votes.set(s.point, (votes.get(s.point) || 0) + 1);
  const id = [...votes.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || label;

  const rec = toRecord(stitch(group));
  rec.label = label;
  rec.shots = group.length;
  rec.header = group.map((s) => s.header).find((h) => h && h.trim()) || '';
  if (out[id]) {
    console.error(`⚠️  ${id} הופיע פעמיים (${out[id].label} ו-${label})`);
    out[`${id}#${label}`] = rec;
  } else {
    out[id] = rec;
  }
}
process.stdout.write(JSON.stringify(out, null, 2));
