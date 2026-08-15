import os, glob, fitz

PUB = r"C:\Projects\acupoints-app\public"
OUT = r"C:\Projects\acupoints-app\sources\pages"

SHORT = {
    "12 האיזורים": "zones12",
    "72 המחטים המוחלטות": "needles72",
    "אבחון 77+88": "rootdx",
    "אבחון על פי שיטה": "diagnosis",
    "הדמיה הולוגרפיה": "mirror",
    "הערוצים באקופנקטורה": "channels",
    "הקדמה לספר של שון": "intro",
    "הקזה": "bleeding",
    "טכניקה וזמן השארת": "technique",
    "טכניקת דיקור דאו מה": "daoma",
    "נקודות מאסטר דונג דגשים": "highlights",
    "עצבוב באקופונקטורה": "innervation",
}

def slug(name):
    for k, v in SHORT.items():
        if name.startswith(k):
            return v
    return "misc"

os.makedirs(OUT, exist_ok=True)
manifest = []

for p in sorted(glob.glob(os.path.join(PUB, "*.pdf"))):
    base = os.path.basename(p)[:-4]
    s = slug(base)
    d = os.path.join(OUT, s)
    os.makedirs(d, exist_ok=True)
    doc = fitz.open(p)
    for i, page in enumerate(doc):
        page.get_pixmap(dpi=150).save(os.path.join(d, f"p{i+1:02d}.png"))
    manifest.append(f"{s:<12} {len(doc):>3} עמ׳   {base}")
    doc.close()

with open(os.path.join(OUT, "..", "MANIFEST.txt"), "w", encoding="utf-8") as f:
    f.write("מיפוי קיצור → קובץ מקור\n" + "=" * 60 + "\n")
    f.write("\n".join(manifest) + "\n")

print("\n".join(manifest))
