# -*- coding: utf-8 -*-
"""בונה את סמלי האפליקציה מהרינדור שעדי בחר.

המקור הוא תמונת ג'מיני שכבר עברה עיבוד: הטורקיז נמתח עד קצוות
הקנבס, הגוון יושר לצבע המותג, והטבעת והמחט הולבנו.

מריצים כך:  python scripts/build-icons.py
"""
import os
import numpy as np
from PIL import Image

SRC = r"C:\Users\zeevz\Desktop\דונג\דונג 2.png"
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public")

src = Image.open(SRC).convert("RGB")


def shrink(img, fraction):
    """מקטין את התוכן ומרפד בצבע השפה, כך שהסמל עדיין מגיע לקצוות.

    נחוץ ל-`purpose: "maskable"`: אנדרואיד חותך את הסמל לצורת עיגול
    או ריבוע מעוגל, וכל מה שמחוץ ל-80% המרכזיים עלול להיחתך. כאן
    הכיתוב יושב נמוך, ובלי ההקטנה הקצוות שלו נמצאים על הגבול.
    """
    n = img.size[0]
    inner = img.resize((int(n * fraction), int(n * fraction)), Image.LANCZOS)
    a = np.asarray(inner).astype(np.float32)
    pad = (n - a.shape[0]) // 2
    out = np.pad(a, ((pad, n - a.shape[0] - pad), (pad, n - a.shape[1] - pad), (0, 0)), mode="edge")
    return Image.fromarray(out.astype(np.uint8), "RGB")


def save(img, name, size):
    p = os.path.join(OUT, name)
    img.resize((size, size), Image.LANCZOS).quantize(colors=256).save(p, optimize=True)
    print("%-24s %6.1f KB" % (name, os.path.getsize(p) / 1024))


# 🚨 לשמות יש סיומת גרסה. שירות הרקע מגיש תמונות בשיטת
# stale-while-revalidate, כלומר מהמטמון קודם - ולכן החלפת קובץ באותו
# שם לא מגיעה לטלפון גם אחרי התקנה מחדש. שינוי שם הוא הדרך היחידה.
# בכל החלפת סמל בעתיד: להעלות את מספר הגרסה בכל ארבעת השמות,
# במניפסט, ב-index.html וברשימת הקדם-מטמון של sw.js.

# purpose "any" - נראה כפי שהוא, בלי חיתוך
save(src, "icon-512-any-v2.png", 512)
save(src, "icon-192-v2.png", 192)
save(src, "apple-touch-icon-v2.png", 180)

# purpose "maskable" - התוכן מוקטן ל-86% כדי לשרוד את החיתוך
save(shrink(src, 0.86), "icon-512-v2.png", 512)
