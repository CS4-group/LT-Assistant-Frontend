import { useRef, useEffect } from 'react'
import { useParallax } from '../../hooks/useParallax'
import LandingNav from './LandingNav'
import HeroSection from './HeroSection'
import FeaturesSection from './FeaturesSection'
import SpotlightSection from './SpotlightSection'
import FooterCTA from './FooterCTA'

export default function LandingPage() {
  const pageRef = useRef(null)
  const heroContentRef = useRef(null)
  const scrollIndicatorRef = useRef(null)
  const heroRef = useRef(null)

  useParallax(pageRef, heroContentRef, scrollIndicatorRef)

  // Scroll reveal observer
  useEffect(() => {
    const page = pageRef.current
    if (!page) return

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const delay = entry.target.dataset.revealDelay || 0
        entry.target.style.setProperty('--reveal-delay', delay)
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
        } else {
          entry.target.classList.remove('is-visible')
        }
      })
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' })

    page.querySelectorAll('.landing-reveal').forEach(el => revealObserver.observe(el))

    // Icon animation triggers
    const iconObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('landing-icon-animate')
        } else {
          entry.target.classList.remove('landing-icon-animate')
        }
      })
    }, { threshold: 0.5 })

    page.querySelectorAll('.landing-bento-icon').forEach(el => iconObserver.observe(el))

    return () => { revealObserver.disconnect(); iconObserver.disconnect() }
  }, [])

  return (
    <div className="page-container landing-page" ref={pageRef}>
      <LandingNav heroRef={heroRef} />
      <HeroSection heroRef={heroRef} heroContentRef={heroContentRef} scrollIndicatorRef={scrollIndicatorRef} />
      <FeaturesSection />
      <SpotlightSection
        badge="Rating System"
        badgeColor=""
        title="Real reviews from real students"
        description="Browse courses, clubs, and teachers with detailed ratings. Filter, search, and make confident choices backed by peer experiences."
        features={[
          { text: 'Star ratings with detailed breakdowns', color: '#ef4444' },
          { text: 'Course, club, and teacher tabs', color: '#ef4444' },
          { text: 'Search and filter capabilities', color: '#ef4444' },
        ]}
        visual="rating"
      />
      <SpotlightSection
        badge="Course Planner"
        badgeColor="blue"
        title="Map your entire high school journey"
        description="Intuitive drag-and-drop interface to plan courses across all four years. Organize by semester with real-time updates and validation."
        features={[
          { text: 'Drag-and-drop course scheduling', color: '#3b82f6' },
          { text: 'Year-by-year tab navigation', color: '#3b82f6' },
          { text: 'Fall and Spring semester views', color: '#3b82f6' },
        ]}
        visual="planner"
        reverse
      />
      <SpotlightSection
        badge="AI Assistant"
        badgeColor="purple"
        title="Your personal course advisor"
        description="Tell the AI what you want in plain English. It understands course requests, suggests placements, and helps you build the perfect schedule."
        features={[
          { text: 'Natural language understanding', color: '#a855f7' },
          { text: 'Smart course recommendations', color: '#a855f7' },
          { text: 'Instant schedule updates', color: '#a855f7' },
        ]}
        visual="ai"
      />
      <FooterCTA />
      <footer className="landing-footer">
        <p>Built for LT students &copy; 2026 LT Assistant</p>
      </footer>
    </div>
  )
}
