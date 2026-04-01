import { useEffect, useRef } from 'react'
export function useRubberBanding() {
  const activeRef = useRef(new Map()); const frameRef = useRef(null)
  useEffect(() => {
    const bands = activeRef.current
    const tick = () => {
      let active = false
      bands.forEach((s, c) => {
        s.target *= 0.92; if (Math.abs(s.target) < 0.5) s.target = 0
        s.velocity += (s.target - s.current) * 0.15; s.velocity *= 0.8; s.current += s.velocity
        if (Math.abs(s.current) > 0.1 || Math.abs(s.target) > 0.1 || Math.abs(s.velocity) > 0.1) {
          active = true; let v = s.current; if (v > 45) v = 45
          c.style.transition = 'none'; c.style.transformOrigin = s.origin === 'top' ? 'top center' : 'bottom center'
          c.style.transform = `scaleY(${1 + v / 400}) translateY(${s.origin === 'top' ? v / 2.5 : -v / 2.5}px)`
        } else { s.current = 0; s.target = 0; s.velocity = 0; c.style.transition = ''; c.style.transform = ''; bands.delete(c) }
      })
      frameRef.current = active ? requestAnimationFrame(tick) : null
    }
    const stretch = (c, d, o) => {
      if (!bands.has(c)) bands.set(c, { current: 0, target: 0, velocity: 0, origin: o })
      const s = bands.get(c); s.origin = o; s.target += Math.min(Math.abs(d), 60) * 0.15
      if (!frameRef.current) frameRef.current = requestAnimationFrame(tick)
    }
    const onWheel = (e) => {
      const gs = (n) => { if (!n || n === document.body || n === document.documentElement) return null; const s = window.getComputedStyle(n); if ((s.overflowY === 'auto' || s.overflowY === 'scroll') && n.scrollHeight > n.clientHeight) return n; return gs(n.parentNode) }
      const c = gs(e.target); if (!c || !c.matches('.items-list, .main-content, .planner-year-content')) return
      if (c.scrollTop <= 0 && e.deltaY < 0) { e.preventDefault(); stretch(c, Math.abs(e.deltaY), 'top') }
      else if (Math.ceil(c.scrollTop + c.clientHeight) >= c.scrollHeight - 1 && e.deltaY > 0) { e.preventDefault(); stretch(c, Math.abs(e.deltaY), 'bottom') }
    }
    document.addEventListener('wheel', onWheel, { passive: false })
    return () => { document.removeEventListener('wheel', onWheel); if (frameRef.current) cancelAnimationFrame(frameRef.current) }
  }, [])
}
