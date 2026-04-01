import { useNavigate } from 'react-router-dom'

export default function FooterCTA() {
  const navigate = useNavigate()

  return (
    <section className="landing-cta">
      <div className="landing-cta-particles">
        {[0, 3, 6, 9, 12, 15, 18, 20].map(i => (
          <span key={i} className="landing-particle landing-particle--cta" style={{ '--i': i }} />
        ))}
      </div>
      <div className="landing-cta-content landing-reveal" data-reveal-delay="0">
        <h2>Ready to plan your future?</h2>
        <p>Join students who are taking control of their high school journey.</p>
        <button className="landing-hero-btn" onClick={() => navigate('/login')}>
          <span>Get Started</span>
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </button>
      </div>
    </section>
  )
}
