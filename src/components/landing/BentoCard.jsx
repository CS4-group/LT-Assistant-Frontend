import { useRef } from 'react'
import { useTiltHover } from '../../hooks/useTiltHover'

export default function BentoCard({ title, description, icon, wide, delay }) {
  const cardRef = useRef(null)
  useTiltHover(cardRef)

  return (
    <div
      ref={cardRef}
      className={`landing-bento-card${wide ? ' landing-bento-card--wide' : ''} landing-reveal`}
      data-reveal-delay={delay}
    >
      <div className="landing-bento-icon" aria-hidden="true">
        {icon}
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}
