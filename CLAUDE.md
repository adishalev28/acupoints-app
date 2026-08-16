# CLAUDE.md — אפליקציית נקודות דיקור (Acupoints)

## מה זה
אפליקציית עיון לנקודות דיקור בשיטת מאסטר טונג. ~316 נקודות, 28 קבצי zones, חיפוש, אבחון, Dao Ma, מועדפים. PWA, RTL עברית.

## Tech Stack
React 19 + Vite 7 + TypeScript + Tailwind 4 (`@tailwindcss/vite`) | Font: Heebo | Deploy: Vercel (auto-deploy)

## Commands
```bash
npm run dev                        # Vite dev server
npm run build                      # tsc + vite build + stamp-sw.js
node scripts/test-diagnosis.mjs    # 15 smoke tests
```

## מבנה
```
src/
├── App.tsx              # Router (11 routes)
├── main.tsx             # React root + SW registration
├── types.ts             # Point, Zone, SourceInfo, DaoMaGroup, IndicationGroup
├── pages/
│   ├── Home.tsx              Explore.tsx            PointDetail.tsx
│   ├── Favorites.tsx         Rubric.tsx             OrganFinder.tsx
│   ├── MirrorMap.tsx         DiagnosisWizard.tsx    DaoMa.tsx
│   ├── SmartDiagnosis.tsx    PrincipleDetail.tsx
├── components/
│   ├── Layout.tsx   Sidebar.tsx   SearchBar.tsx
│   ├── FilterTabs.tsx   ZoneFilter.tsx   PointCard.tsx
├── hooks/
│   ├── useFavorites.ts   useNotes.ts   useDarkMode.ts   useSearchHistory.ts
├── utils/
│   ├── buildRubric.ts              # Symptom→point index (20+ categories)
│   ├── categorizeIndications.ts    # Symptom→organ mapping
│   ├── searchScoring.ts            # Hebrew fuzzy search (strips ה/ים/ות/י)
│   ├── reactionAreaNormalization.ts # Innervation hierarchy
│   └── treatmentPrinciples.ts      # Contralateral/ipsilateral rules
├── data/
│   ├── points.ts          # Master array (~316 points aggregated)
│   ├── zones.ts           # 12 zones (Hebrew+English names)
│   ├── principles.ts      # 12+ treatment principles
│   ├── daoMaGroups.ts     # Organ+Phase clinical groups
│   ├── organTherapy.ts    # 5 organ profiles (heart/liver/spleen/lung/kidney)
│   ├── mirrorMap.ts       # Point correspondences
│   ├── pathogenesis.ts    # 10 disease pattern maps
│   └── zones/             # 28 files (~8700 lines total)
│       ├── zone{11-1010}.ts + extra variants
│       ├── zoneVT.ts      # Chest & abdomen
│       └── zoneDT{a,b,c}.ts  # Back & neck (split to 3)
└── svg/HandDorsal.tsx
```

## Point Interface
```typescript
interface Point {
  id: string              // '11.01', 'DT.15'
  zone: string            // '11', 'VT', 'DT'
  pinyinName, chineseName, hebrewName, englishName: string
  location: string        // Hebrew anatomical description
  needling: string        // Depth & technique (Hebrew)
  reactionAreas: string[]
  indications: string[] | IndicationGroup[]
  additionalInfo: string
  imageId?: string        // → /images/{id}.{jpg|png|webp}
  sources: SourceInfo[]   // tung-study | sean-goodman | mccann-atlas | other
  daoMaGroup?: string
  absoluteNeedle?: '72' | '32'
}
```

## Routes
```
/                → Home           /explore        → Search & browse
/point/:id       → Point detail   /favorites      → Saved points
/rubric          → Symptom index  /organs         → Organ lookup
/mirror          → Mirror map     /diagnosis      → Symptom wizard
/dao-ma          → Dao Ma groups  /smart-diagnosis → Advanced diagnosis
/principle/:id   → Theory pages
```

URL params: `q` (search), `tab` (all|indications|reactionAreas), `zone`, `filter` (72|32)

## Zone file pattern
- קבצים גדולים מפוצלים: `zoneDTa.ts`, `zoneDTb.ts`, `zoneDTc.ts`
- קובץ ראשי מאחד: `...zoneDTaPoints, ...zoneDTbPoints, ...zoneDTcPoints`
- אותו דפוס ב-zone1010, zone22extra

## Scripts
| סקריפט | תפקיד |
|--------|-------|
| `stamp-sw.js` | Cache-bust SW בבילד |
| `test-diagnosis.mjs` | 15 smoke tests לאבחון |
| `mark-absolute-needles.cjs` | סימון מחטים 72/32 |
| `normalize-reaction-areas.cjs` | תקנון אזורי תגובה |
| `merge-dao-ma.cjs` | איחוד קבוצות Dao Ma |
| `generate-icons.mjs` | PWA icons מ-SVG |

## כללים
- TypeScript strict mode
- RTL + עברית (Heebo font)
- localStorage: favorites, notes, dark mode, search history
- Dark mode built-in (`useDarkMode`)
- Theme color: Teal `#0d7377`
- Sources tracked: tung-study, sean-goodman, mccann-atlas, other
- Images at `/images/{pointId}.{ext}`
