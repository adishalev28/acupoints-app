# -*- coding: utf-8 -*-
"""
מייצר את תמונות אזורי ההקזה בגב (DT.18-DT.22).

הבעיה שהכלי פותר: חמש הנקודות קיבלו את אותו תרשים גנרי של הגב עם כל
חמשת האזורים מסומנים, בלי שום סימון של האזור השייך לנקודה הנוכחית.

כאן נלקח תרשים בסיס אחד (sources/bleeding-bases/back-zones.jpg) ומיוצרות
ממנו חמש תמונות, כל אחת עם הרצועה הרלוונטית בהדגשה והשאר מעומעם.

הרצה:  python scripts/gen-dt-bleeding-images.py
"""
import os
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = os.path.join(ROOT, 'sources', 'bleeding-bases', 'back-zones.jpg')
OUTDIR = os.path.join(ROOT, 'public', 'images')

# גבולות הרצועות בתרשים הבסיס (פיקסלים, אחרי החיתוך)
SEPARATORS = [237, 386, 577, 707, 890, 1056]

# נקודה -> אינדקס הרצועה מלמעלה למטה
ZONES = {
    'DT.19': (0, 'Lungs and Heart'),
    'DT.20': (1, 'Liver'),
    'DT.21': (2, 'Spleen and Stomach'),
    'DT.22': (3, 'Kidneys'),
    'DT.18': (4, 'Sacrum'),
}

DIM = 0.62                 # כמה לעמעם את מה שמחוץ לרצועה
ACCENT = (198, 40, 40)     # מסגרת ההדגשה
FILL = (214, 69, 69, 28)   # מילוי שקוף קל


def build(point_id, band_index):
    base = Image.open(BASE).convert('RGB')
    top, bottom = SEPARATORS[band_index], SEPARATORS[band_index + 1]

    img = Image.blend(base, Image.new('RGB', base.size, 'white'), DIM)
    img.paste(base.crop((0, top, base.width, bottom)), (0, top))

    d = ImageDraw.Draw(img, 'RGBA')
    box = [10, top, base.width - 10, bottom]
    d.rectangle(box, fill=FILL)
    d.rectangle(box, outline=ACCENT + (255,), width=6)

    img.save(os.path.join(OUTDIR, point_id + '.jpg'), quality=90)
    return point_id


if __name__ == '__main__':
    for pid, (idx, label) in sorted(ZONES.items()):
        build(pid, idx)
        print('%s  ->  %s' % (pid, label))
