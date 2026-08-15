# לכידת אפליקציית שון גודמן דרך Phone Link

כלים לקריאה אוטומטית של "MASTER TUNG'S POINTS" מהטלפון המשוקף למחשב.
נבנה 14.8.2026 אחרי שהתגלה שהחילוץ המקורי איבד את גבולות כרטיסי ההתוויות.

## דרישות
- Phone Link פתוח עם שיקוף מסך (תהליך `YourPhoneAppProxy`)
- האפליקציה פתוחה על נקודה כלשהי

## שימוש

```bash
SP=scripts/phone-capture
# איתור + מיקסום + צילום
powershell -NoProfile -File $SP/phone.ps1 -Max -Out shot.png
# צילום בלי לגעת בחלון (אחרי שכבר בחזית)
powershell -NoProfile -File $SP/phone.ps1 -NoFocus -Out shot.png
# רשימת כל החלונות
powershell -NoProfile -File $SP/phone.ps1 -List

# גלילה למטה (Amount שלילי)
powershell -NoProfile -File $SP/input.ps1 -Action scroll -X 960 -Y 700 -Amount -5
# לחיצה
powershell -NoProfile -File $SP/input.ps1 -Action click -X 1868 -Y 953
```

## קואורדינטות במסך מלא 1920x988

| אלמנט | X | Y |
|-------|---|---|
| טאב Location | 68 | 167 |
| טאב Needling | 633 | 167 |
| טאב Reaction Area | 1227 | 167 |
| טאב Indications | 1830 | 167 |
| **נקודה הבאה >** | **1868** | **953** |
| נקודה קודמת < | 45 | 953 |
| ⭐ מועדפים | 955 | 940 |

## ⚠️ כללי בטיחות
- **לא ללחוץ על הכוכב (955, 940)** — משנה מועדפים אצל המשתמש
- **לא ללחוץ על "Add a Note"** — משנה נתונים
- מותר: גלילה, הטאבים למעלה, והחצים בקצוות

## מלכודות שנתקלנו בהן
1. **DPI** — חובה `SetProcessDPIAware()` בשני הסקריפטים, אחרת הקואורדינטות לא תואמות
2. **SW_RESTORE (9) מבטל מיקסום** — להשתמש ב-SW_SHOW (5) או SW_MAXIMIZE (3)
3. **צילום תופס את מה שגלוי למעלה** — חובה `SetForegroundWindow` לפני
4. **המלבן משתנה אחרי הבאה לחזית** — למדוד מחדש
5. **זיהוי לפי יחס גובה-רוחב תפס את חלון Claude** — לזהות לפי `YourPhoneAppProxy`
6. **החיפוש באפליקציה לא מקבל מספרי נקודות** — לנווט דרך Zone
7. נקודה חדשה נפתחת בטאב Location — צריך ללחוץ Indications בכל פעם
