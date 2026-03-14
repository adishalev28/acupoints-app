interface HandDorsalProps {
  highlightPoints?: string[]
  className?: string
}

export default function HandDorsal({ highlightPoints = [], className = '' }: HandDorsalProps) {
  const isHighlighted = (id: string) => highlightPoints.includes(id)

  return (
    <svg
      viewBox="0 0 300 420"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background */}
      <rect width="300" height="420" fill="currentColor" rx="12" className="text-white dark:text-dark-card" />

      {/* Hand outline - dorsal view */}
      <g stroke="#374151" strokeWidth="1.5" fill="#f9fafb">
        {/* Palm */}
        <path d="M90,350 Q80,320 75,280 Q70,240 85,200 L100,180 L200,180 L215,200 Q230,240 225,280 Q220,320 210,350 Z" />

        {/* Thumb */}
        <path d="M85,200 Q60,180 45,150 Q35,130 40,110 Q45,95 55,90 Q65,85 75,90 Q85,100 80,120 Q75,140 85,165 L90,180" />

        {/* Index finger */}
        <path d="M100,180 Q95,150 93,120 Q91,90 93,60 Q95,40 105,35 Q115,30 120,40 Q125,50 122,80 Q120,110 118,140 L115,180" />

        {/* Middle finger */}
        <path d="M130,180 Q128,145 126,110 Q124,75 126,40 Q128,20 140,15 Q152,10 157,20 Q162,30 160,60 Q158,90 156,120 L155,180" />

        {/* Ring finger */}
        <path d="M165,180 Q163,150 162,120 Q160,85 163,50 Q165,35 175,30 Q185,28 190,38 Q195,48 192,80 Q190,110 188,140 L185,180" />

        {/* Pinky */}
        <path d="M195,185 Q195,160 195,135 Q195,105 197,80 Q199,65 207,60 Q215,58 220,65 Q225,75 222,100 Q220,125 218,150 L215,185" />
      </g>

      {/* Bone structure lines (simplified) */}
      <g stroke="#d1d5db" strokeWidth="0.8" fill="none" strokeDasharray="3,3">
        {/* Metacarpals */}
        <line x1="107" y1="180" x2="105" y2="90" />
        <line x1="140" y1="180" x2="140" y2="70" />
        <line x1="173" y1="180" x2="175" y2="80" />
        <line x1="200" y1="185" x2="207" y2="100" />

        {/* Joint lines */}
        <line x1="90" y1="130" x2="120" y2="125" />
        <line x1="90" y1="90" x2="120" y2="70" />
        <line x1="125" y1="120" x2="160" y2="115" />
        <line x1="125" y1="70" x2="160" y2="55" />
        <line x1="160" y1="120" x2="190" y2="115" />
        <line x1="160" y1="75" x2="192" y2="72" />
        <line x1="193" y1="130" x2="220" y2="128" />
        <line x1="195" y1="95" x2="222" y2="90" />
      </g>

      {/* Acupoint markers */}
      {/* 11.01 Da Jian - between 1st and 2nd phalanx of thumb, radial side */}
      <circle cx="65" cy="120" r={isHighlighted('11.01') ? 7 : 5} fill={isHighlighted('11.01') ? '#0d7377' : '#ef4444'} />
      <text x="30" y="118" fontSize="8" fill="#374151" textAnchor="end">11.01</text>

      {/* 11.02 Xiao Jian - between 1st and 2nd phalanx of thumb, ulnar side */}
      <circle cx="78" cy="115" r={isHighlighted('11.02') ? 7 : 5} fill={isHighlighted('11.02') ? '#0d7377' : '#ef4444'} />
      <text x="78" y="105" fontSize="8" fill="#374151" textAnchor="middle">11.02</text>

      {/* 11.03 Fu Jian - center of 1st phalanx of thumb */}
      <circle cx="55" cy="140" r={isHighlighted('11.03') ? 7 : 5} fill={isHighlighted('11.03') ? '#0d7377' : '#ef4444'} />
      <text x="30" y="145" fontSize="8" fill="#374151" textAnchor="end">11.03</text>

      {/* 11.06 Huo Zhu - between 2nd and 3rd phalanx of index, radial side */}
      <circle cx="97" cy="70" r={isHighlighted('11.06') ? 7 : 5} fill={isHighlighted('11.06') ? '#0d7377' : '#ef4444'} />
      <text x="80" y="65" fontSize="8" fill="#374151" textAnchor="end">11.06</text>

      {/* 11.09 Xin Xi - between 1st and 2nd phalanx of middle finger */}
      <circle cx="140" cy="115" r={isHighlighted('11.09') ? 7 : 5} fill={isHighlighted('11.09') ? '#0d7377' : '#ef4444'} />
      <text x="155" y="113" fontSize="8" fill="#374151">11.09</text>

      {/* 11.10 Mu Huo - between 2nd and 3rd phalanx of middle finger */}
      <circle cx="135" cy="60" r={isHighlighted('11.10') ? 7 : 5} fill={isHighlighted('11.10') ? '#0d7377' : '#ef4444'} />
      <text x="118" y="55" fontSize="8" fill="#374151" textAnchor="end">11.10</text>

      {/* Legend */}
      <g transform="translate(20, 380)">
        <circle cx="5" cy="5" r="4" fill="#ef4444" />
        <text x="15" y="9" fontSize="9" fill="#6b7280">נקודת דיקור</text>
        <circle cx="100" cy="5" r="5" fill="#0d7377" />
        <text x="110" y="9" fontSize="9" fill="#6b7280">נקודה נבחרת</text>
      </g>
    </svg>
  )
}
