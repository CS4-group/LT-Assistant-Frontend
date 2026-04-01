import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import siftLogo from '../../assets/sift.png'

export default function LandingNav({ heroRef }) {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        setScrolled(!entry.isIntersecting)
      })
    }, { threshold: 0, rootMargin: '-80px 0px 0px 0px' })

    observer.observe(hero)
    return () => observer.disconnect()
  }, [heroRef])

  return (
    <nav className={`landing-nav${scrolled ? ' landing-nav--scrolled' : ''}`}>
      <div className="landing-nav-inner">
        <div className="landing-nav-logo">
          <img src={siftLogo} alt="LT" className="landing-nav-logo-img" />
          <span className="landing-nav-brand">LT Assistant</span>
        </div>
        <button className="landing-nav-cta" onClick={() => navigate('/login')}>
          Launch App
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </button>
      </div>
    </nav>
  )
}
