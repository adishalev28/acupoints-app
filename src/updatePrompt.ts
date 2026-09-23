// עדכון גרסה בלי לקטוע את המשתמש: במקום רענון כפוי שמעלים את המסך לשנייה,
// מופיעה למטה הודעה קטנה עם כפתור רענון. בלי לחיצה, הגרסה החדשה ממילא תיטען
// בפעם הבאה שהאפליקציה נפתחת, כי ה-Service Worker כבר השתלט על הדף.

export function showUpdatePrompt(): void {
  if (document.getElementById('app-update-prompt')) return

  const bar = document.createElement('div')
  bar.id = 'app-update-prompt'
  bar.dir = 'rtl'
  bar.setAttribute('role', 'status')
  bar.style.cssText = [
    'position:fixed', 'inset-inline:0', 'bottom:calc(4.5rem + env(safe-area-inset-bottom))',
    'z-index:2147483000', 'display:flex', 'justify-content:center', 'pointer-events:none',
    'font-family:Heebo,system-ui,sans-serif',
  ].join(';')

  const card = document.createElement('div')
  card.style.cssText = [
    'pointer-events:auto', 'display:flex', 'align-items:center', 'gap:12px',
    'background:#0d7377', 'color:#fff', 'border-radius:999px',
    'padding:10px 14px 10px 10px', 'box-shadow:0 8px 24px rgba(0,0,0,.35)',
    'font-size:15px', 'max-width:calc(100vw - 24px)',
  ].join(';')

  const text = document.createElement('span')
  text.textContent = 'יש גרסה חדשה'

  const refresh = document.createElement('button')
  refresh.type = 'button'
  refresh.textContent = 'רענון'
  refresh.style.cssText = [
    'font:inherit', 'font-weight:700', 'cursor:pointer', 'border:0',
    'background:#fff', 'color:#0d7377', 'border-radius:999px', 'padding:6px 14px',
  ].join(';')
  refresh.addEventListener('click', () => window.location.reload())

  const close = document.createElement('button')
  close.type = 'button'
  close.setAttribute('aria-label', 'סגירה')
  close.textContent = '×'
  close.style.cssText = [
    'font:inherit', 'font-size:20px', 'line-height:1', 'cursor:pointer', 'border:0',
    'background:transparent', 'color:#cdeceb', 'padding:0 4px',
  ].join(';')
  close.addEventListener('click', () => bar.remove())

  card.append(text, refresh, close)
  bar.append(card)
  document.body.append(bar)
}
