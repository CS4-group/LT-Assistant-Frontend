import BentoCard from './BentoCard'

const cards = [
  {
    id: 'stars',
    title: 'Course Rating System',
    description: 'Rate courses, clubs, and teachers with star ratings. Read authentic peer reviews, search and filter to make informed decisions about your classes.',
    wide: true,
    delay: 0,
    icon: (
      <svg viewBox="0 0 80 80" className="landing-icon-svg landing-icon-stars">
        <path className="landing-star landing-star-1" d="M40 10l7.5 15.2 16.8 2.4-12.15 11.85 2.87 16.7L40 48.1l-15.02 8.05 2.87-16.7L15.7 27.6l16.8-2.4z" fill="none" stroke="#fbbf24" strokeWidth="2" />
        <path className="landing-star landing-star-2" d="M18 52l4 8.1 8.9 1.3-6.45 6.3 1.52 8.9L18 72.3l-7.97 4.3 1.52-8.9L5.1 61.4l8.9-1.3z" fill="none" stroke="#fbbf24" strokeWidth="1.5" opacity="0.5" />
        <path className="landing-star landing-star-3" d="M62 50l4 8.1 8.9 1.3-6.45 6.3 1.52 8.9L62 70.3l-7.97 4.3 1.52-8.9-6.45-6.3 8.9-1.3z" fill="none" stroke="#fbbf24" strokeWidth="1.5" opacity="0.5" />
        <circle className="landing-star-sparkle" cx="58" cy="14" r="1.5" fill="#fbbf24" opacity="0" />
        <circle className="landing-star-sparkle" cx="22" cy="18" r="1" fill="#fbbf24" opacity="0" />
      </svg>
    )
  },
  {
    id: 'calendar',
    title: '4-Year Course Planner',
    description: 'Drag-and-drop scheduling across all four years with semester-by-semester views.',
    wide: false,
    delay: 1,
    icon: (
      <svg viewBox="0 0 80 80" className="landing-icon-svg landing-icon-calendar">
        <rect className="landing-cal-frame" x="10" y="16" width="60" height="52" rx="6" fill="none" stroke="currentColor" strokeWidth="2" />
        <line className="landing-cal-header" x1="10" y1="30" x2="70" y2="30" stroke="currentColor" strokeWidth="2" />
        <line className="landing-cal-divider" x1="40" y1="30" x2="40" y2="68" stroke="currentColor" strokeWidth="1" opacity="0.3" />
        {Array.from({ length: 10 }, (_, i) => {
          const col = i % 4
          const row = Math.floor(i / 4)
          const x = 16 + col * 14
          const y = row < 2 ? 35 + row * 12 : 59
          const h = row < 2 ? 8 : 6
          return <rect key={i} className="landing-cal-cell" x={x} y={y} width="10" height={h} rx="2" fill="currentColor" opacity="0" style={{ '--cell-i': i }} />
        })}
      </svg>
    )
  },
  {
    id: 'ai',
    title: 'AI Course Assistant',
    description: 'Natural language course requests and smart recommendations powered by AI.',
    wide: false,
    delay: 2,
    icon: (
      <svg viewBox="0 0 80 80" className="landing-icon-svg landing-icon-ai">
        <rect className="landing-ai-bubble" x="12" y="14" width="56" height="36" rx="12" fill="none" stroke="currentColor" strokeWidth="2" />
        <polygon className="landing-ai-tail" points="26,50 38,50 30,60" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle className="landing-ai-dot" cx="30" cy="32" r="3" fill="currentColor" style={{ '--dot-i': 0 }} />
        <circle className="landing-ai-dot" cx="40" cy="32" r="3" fill="currentColor" style={{ '--dot-i': 1 }} />
        <circle className="landing-ai-dot" cx="50" cy="32" r="3" fill="currentColor" style={{ '--dot-i': 2 }} />
        <path className="landing-ai-sparkle" d="M62 10l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#fbbf24" opacity="0" />
        <path className="landing-ai-sparkle landing-ai-sparkle-2" d="M14 8l1.5 3.5 3.5 1.5-3.5 1.5-1.5 3.5-1.5-3.5-3.5-1.5 3.5-1.5z" fill="#ef4444" opacity="0" />
      </svg>
    )
  },
  {
    id: 'steps',
    title: 'Smart Onboarding',
    description: 'Personalized 5-step profile setup with career path and interest matching.',
    wide: false,
    delay: 3,
    icon: (
      <svg viewBox="0 0 80 80" className="landing-icon-svg landing-icon-steps">
        <line className="landing-step-line" x1="12" y1="40" x2="68" y2="40" stroke="currentColor" strokeWidth="2" opacity="0.3" />
        <line className="landing-step-fill" x1="12" y1="40" x2="68" y2="40" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="56" strokeDashoffset="56" />
        {[12, 26, 40, 54, 68].map((cx, i) => (
          <circle key={i} className="landing-step-dot" cx={cx} cy="40" r="6" fill="none" stroke="currentColor" strokeWidth="2" style={{ '--step-i': i }} />
        ))}
        <path className="landing-step-check" d="M36 40l3 3 5-6" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0" />
      </svg>
    )
  },
  {
    id: 'theme',
    title: 'Dark Mode',
    description: 'Beautiful dark and light themes that adapt to your preference.',
    wide: false,
    delay: 4,
    icon: (
      <svg viewBox="0 0 80 80" className="landing-icon-svg landing-icon-theme">
        <circle className="landing-theme-sun" cx="40" cy="40" r="12" fill="#fbbf24" />
        <g className="landing-theme-rays" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round">
          <line x1="40" y1="10" x2="40" y2="20" />
          <line x1="40" y1="60" x2="40" y2="70" />
          <line x1="13.8" y1="18.8" x2="20.8" y2="25.8" />
          <line x1="59.2" y1="54.2" x2="66.2" y2="61.2" />
          <line x1="10" y1="40" x2="20" y2="40" />
          <line x1="60" y1="40" x2="70" y2="40" />
          <line x1="13.8" y1="61.2" x2="20.8" y2="54.2" />
          <line x1="59.2" y1="25.8" x2="66.2" y2="18.8" />
        </g>
        <circle className="landing-theme-moon" cx="50" cy="34" r="11" fill="#0a0e1a" opacity="0" />
      </svg>
    )
  }
]

export default function FeaturesSection() {
  return (
    <section className="landing-features">
      <h2 className="landing-section-title landing-reveal" data-reveal-delay="0">Everything you need</h2>
      <p className="landing-section-subtitle landing-reveal" data-reveal-delay="1">Powerful tools for every step of your high school journey</p>
      <div className="landing-bento">
        {cards.map(card => (
          <BentoCard key={card.id} {...card} />
        ))}
      </div>
    </section>
  )
}
