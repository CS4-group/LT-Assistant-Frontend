import { useEffect } from 'react'

export function useParallax(containerRef, contentRef, indicatorRef) {
  useEffect(() => {
    const container = containerRef.current
    const content = contentRef.current
    const indicator = indicatorRef.current
    if (!container) return

    const onScroll = () => {
      const scrollY = container.scrollTop
      if (scrollY < window.innerHeight && content) {
        const progress = scrollY / window.innerHeight
        content.style.transform = `translateY(${scrollY * 0.3}px)`
        content.style.opacity = 1 - progress * 1.2
      }
      if (indicator) {
        indicator.style.opacity = Math.max(0, 1 - (scrollY / 200))
      }
    }

    container.addEventListener('scroll', onScroll)
    return () => container.removeEventListener('scroll', onScroll)
  }, [])
}
