function CheckIcon({ color }) {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function RatingVisual() {
  return (
    <div className="landing-spotlight-visual">
      <div className="landing-spotlight-glow"></div>
      <svg viewBox="0 0 200 160" className="landing-spotlight-svg" aria-hidden="true">
        <rect x="10" y="10" width="180" height="140" rx="12" fill="rgba(17,24,39,0.8)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <rect className="landing-spot-tab" x="20" y="20" width="45" height="20" rx="6" fill="#c42525" opacity="0.9" />
        <rect className="landing-spot-tab" x="70" y="20" width="35" height="20" rx="6" fill="rgba(255,255,255,0.1)" />
        <rect className="landing-spot-tab" x="110" y="20" width="45" height="20" rx="6" fill="rgba(255,255,255,0.1)" />
        <g className="landing-spot-stars" transform="translate(20, 55)">
          {[0, 1, 2, 3].map(i => (
            <polygon key={i} points={`${8+i*20},0 ${10.5+i*20},5 ${16+i*20},6 ${12+i*20},10 ${13+i*20},16 ${8+i*20},13 ${3+i*20},16 ${4+i*20},10 ${i*20},6 ${5.5+i*20},5`} fill="#fbbf24" className="landing-spot-star" style={{ '--si': i }} />
          ))}
          <polygon points="88,0 90.5,5 96,6 92,10 93,16 88,13 83,16 84,10 80,6 85.5,5" fill="rgba(255,255,255,0.15)" className="landing-spot-star" style={{ '--si': 4 }} />
        </g>
        {[80, 92, 104].map((y, i) => (
          <g key={i}>
            <rect className="landing-spot-bar" x="20" y={y} width="120" height="6" rx="3" fill="rgba(255,255,255,0.08)" />
            <rect className="landing-spot-bar-fill" x="20" y={y} width="0" height="6" rx="3" fill="#c42525" style={{ '--bar-w': [95, 72, 55][i] }} />
          </g>
        ))}
        <rect x="20" y="118" width="160" height="24" rx="6" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
      </svg>
    </div>
  )
}

function PlannerVisual() {
  return (
    <div className="landing-spotlight-visual">
      <div className="landing-spotlight-glow landing-spotlight-glow--blue"></div>
      <svg viewBox="0 0 200 160" className="landing-spotlight-svg" aria-hidden="true">
        <rect x="10" y="10" width="180" height="140" rx="12" fill="rgba(17,24,39,0.8)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <rect className="landing-spot-yr" x="20" y="20" width="32" height="18" rx="5" fill="#c42525" />
        <rect className="landing-spot-yr" x="56" y="20" width="32" height="18" rx="5" fill="rgba(255,255,255,0.08)" />
        <rect className="landing-spot-yr" x="92" y="20" width="32" height="18" rx="5" fill="rgba(255,255,255,0.08)" />
        <rect className="landing-spot-yr" x="128" y="20" width="32" height="18" rx="5" fill="rgba(255,255,255,0.08)" />
        <rect x="20" y="46" width="75" height="12" rx="4" fill="rgba(59,130,246,0.2)" stroke="rgba(59,130,246,0.3)" strokeWidth="0.5" />
        <rect x="105" y="46" width="75" height="12" rx="4" fill="rgba(16,185,129,0.2)" stroke="rgba(16,185,129,0.3)" strokeWidth="0.5" />
        {[0,1,2,3,4,5,6,7].map(i => {
          const x = i < 4 ? 20 : 105
          const y = 64 + (i % 4) * 16
          return <rect key={i} className="landing-spot-slot" x={x} y={y} width="75" height="12" rx="4" fill="rgba(255,255,255,0.06)" style={{ '--slot-i': i }} />
        })}
        <rect className="landing-spot-drag" x="22" y="66" width="71" height="8" rx="3" fill="rgba(196,37,37,0.4)" stroke="#c42525" strokeWidth="0.5" strokeDasharray="3 2" opacity="0" />
      </svg>
    </div>
  )
}

function AIVisual() {
  return (
    <div className="landing-spotlight-visual">
      <div className="landing-spotlight-glow landing-spotlight-glow--purple"></div>
      <svg viewBox="0 0 200 160" className="landing-spotlight-svg" aria-hidden="true">
        <rect x="10" y="10" width="180" height="140" rx="12" fill="rgba(17,24,39,0.8)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <rect x="20" y="18" width="160" height="22" rx="6" fill="rgba(255,255,255,0.05)" />
        <circle cx="34" cy="29" r="5" fill="#10b981" />
        <rect className="landing-spot-msg" x="60" y="48" width="110" height="22" rx="8" fill="rgba(196,37,37,0.2)" stroke="rgba(196,37,37,0.3)" strokeWidth="0.5" style={{ '--msg-i': 0 }} />
        <rect className="landing-spot-msg" x="20" y="78" width="130" height="30" rx="8" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" style={{ '--msg-i': 1 }} />
        <rect className="landing-spot-msg" x="80" y="116" width="90" height="22" rx="8" fill="rgba(196,37,37,0.2)" stroke="rgba(196,37,37,0.3)" strokeWidth="0.5" style={{ '--msg-i': 2 }} />
        <g className="landing-spot-typing" transform="translate(20, 116)">
          <rect width="50" height="22" rx="8" fill="rgba(255,255,255,0.06)" />
          <circle cx="16" cy="11" r="2.5" fill="rgba(255,255,255,0.4)" className="landing-spot-tdot" style={{ '--td': 0 }} />
          <circle cx="25" cy="11" r="2.5" fill="rgba(255,255,255,0.4)" className="landing-spot-tdot" style={{ '--td': 1 }} />
          <circle cx="34" cy="11" r="2.5" fill="rgba(255,255,255,0.4)" className="landing-spot-tdot" style={{ '--td': 2 }} />
        </g>
      </svg>
    </div>
  )
}

const visuals = { rating: RatingVisual, planner: PlannerVisual, ai: AIVisual }

export default function SpotlightSection({ badge, badgeColor, title, description, features, visual, reverse }) {
  const Visual = visuals[visual]

  return (
    <section className={`landing-spotlight${reverse ? ' landing-spotlight--reverse' : ''}`}>
      <div className="landing-spotlight-inner landing-reveal" data-reveal-delay="0">
        <Visual />
        <div className="landing-spotlight-text">
          <span className={`landing-spotlight-badge${badgeColor ? ` landing-spotlight-badge--${badgeColor}` : ''}`}>{badge}</span>
          <h2>{title}</h2>
          <p>{description}</p>
          <ul className="landing-spotlight-features">
            {features.map((feat, i) => (
              <li key={i} className="landing-reveal" data-reveal-delay={i + 1}>
                <CheckIcon color={feat.color} />
                {feat.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
