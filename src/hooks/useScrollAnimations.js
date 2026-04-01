import { useEffect } from 'react'
export function useScrollAnimations() {
  useEffect(() => {
    if (CSS.supports('animation-timeline: view()')) return
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const rect = entry.boundingClientRect
        const wh = window.innerHeight || document.documentElement.clientHeight
        if (entry.isIntersecting) { entry.target.classList.remove('scroll-leave-bottom'); entry.target.classList.add('scroll-visible') }
        else { entry.target.classList.remove('scroll-visible'); if (rect.top > wh / 2) entry.target.classList.add('scroll-leave-bottom'); else entry.target.classList.add('scroll-visible') }
      })
    }, { threshold: 0.15, rootMargin: '0px 0px -20px 0px' })
    const mo = new MutationObserver(muts => { muts.forEach(m => { m.addedNodes.forEach(n => { if (n.nodeType !== 1) return; if (n.matches?.('.item-card, .review-card, .course-card')) observer.observe(n); n.querySelectorAll?.('.item-card, .review-card, .course-card').forEach(el => observer.observe(el)) }) }) })
    mo.observe(document.body, { childList: true, subtree: true })
    document.querySelectorAll('.item-card, .review-card, .course-card').forEach(el => observer.observe(el))
    return () => { observer.disconnect(); mo.disconnect() }
  }, [])
}
