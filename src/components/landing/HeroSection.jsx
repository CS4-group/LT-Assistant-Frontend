import { useNavigate } from 'react-router-dom'
import ParticleCanvas from './ParticleCanvas'
import siftLogo from '../../assets/sift.png'

export default function HeroSection({ heroRef, heroContentRef, scrollIndicatorRef }) {
  const navigate = useNavigate()

  return (
    <section className="landing-hero" ref={heroRef}>
      <div className="landing-hero-bg"></div>
      <ParticleCanvas />
      <div className="landing-particles">
        {Array.from({ length: 20 }, (_, i) => (
          <span key={i} className="landing-particle" style={{ '--i': i }} />
        ))}
      </div>
      <div className="landing-hero-content" ref={heroContentRef}>
        <img src={siftLogo} alt="LT Assistant" className="landing-hero-logo" />
        <h1 className="landing-hero-appname">LT Assistant</h1>
        <p className="landing-hero-tagline">
          <span className="landing-word" style={{ '--word-i': 0 }}>Plan.</span>
          <span className="landing-word" style={{ '--word-i': 1 }}>Rate.</span>
          <span className="landing-word" style={{ '--word-i': 2 }}>Succeed.</span>
        </p>
        <p className="landing-hero-subtitle">Your AI-powered high school course planning companion</p>
        <button className="landing-hero-btn" onClick={() => navigate('/login')}>
          <span>Launch App</span>
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </button>
      </div>
      <div className="landing-scroll-indicator" ref={scrollIndicatorRef}>
        <span>Scroll to explore</span>
        <div className="landing-scroll-arrow">
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14" />
            <path d="m19 12-7 7-7-7" />
          </svg>
        </div>
      </div>
    </section>
  )
}
