const fs = require('fs');
const catalog = require('./catalog.json');

// כולל את הריל הראשון שעדי אישר ידנית
const all = [
  { id: '1419363969955087', he: 'נקישות בלסת - שחרור השריר', cat: 'לסת' },
  ...catalog,
  // סרטוני טיקטוק של דמיאני על טנטון (1.10.2026) - בלי כריכה שמורה
  { id: 'tt-7395420704310578462', he: 'טנטון - שחרור שריר הלעיסה (masseter)', cat: ['טנטון', 'לסת'],
    platform: 'tiktok', url: 'https://www.tiktok.com/@drjoedamiani/video/7395420704310578462' },
  { id: 'tt-7426965978241715498', he: 'צלצול ולחץ באוזן - בדיקה עצמית אם זה מהלסת', cat: ['טנטון', 'אוזן ודיגסטריק'],
    platform: 'tiktok', url: 'https://www.tiktok.com/@drjoedamiani/video/7426965978241715498' },
  { id: 'tt-7451785283189755178', he: 'מלאות ולחץ באוזן - שחרור medial pterygoid', cat: ['טנטון', 'אוזן ודיגסטריק'],
    platform: 'tiktok', url: 'https://www.tiktok.com/@drjoedamiani/video/7451785283189755178' },
  { id: 'tt-7625766897509862670', he: 'מתח בלסת שמגיע מהצוואר - טרפז ו-SCM', cat: ['טנטון', 'צוואר', 'שריר SCM ויציבה'],
    platform: 'tiktok', url: 'https://www.tiktok.com/@drjoedamiani/video/7625766897509862670' },
];

function esc(s) { return s.replace(/'/g, "\'"); }

const entries = all.map(x => {
  const cats = Array.isArray(x.cat) ? x.cat : [x.cat];
  const primary = cats[0];
  const catsLine = cats.length > 1
    ? `\n    categories: [${cats.map(c => `'${esc(c)}'`).join(', ')}],`
    : '';
  return `  {
    id: '${x.id}',
    title: '${esc(x.he)}',
    category: '${esc(primary)}',${catsLine}
    platform: '${x.platform || 'facebook'}',
    url: '${x.url || `https://www.facebook.com/reel/${x.id}/`}',
    source: 'Dr. Joe Damiani',
  },`;
}).join('\n');

const arrayText = `export const treatmentVideos: TreatmentVideo[] = [\n${entries}\n]`;

let file = fs.readFileSync('src/data/videos.ts', 'utf8');
const startMarker = 'export const treatmentVideos: TreatmentVideo[] = [';
const startIdx = file.indexOf(startMarker);
if (startIdx === -1) throw new Error('start marker not found');
// מצא את ה-] שסוגר את המערך (השורה הראשונה שמתחילה ב-] אחרי ההתחלה)
const after = file.indexOf('\n]', startIdx);
if (after === -1) throw new Error('end marker not found');
const endIdx = after + 2; // כולל "\n]"

const newFile = file.slice(0, startIdx) + arrayText + file.slice(endIdx);
fs.writeFileSync('src/data/videos.ts', newFile);
console.log('Wrote videos.ts with', all.length, 'videos');
