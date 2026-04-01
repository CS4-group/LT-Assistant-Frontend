import { useState, useEffect, useRef } from 'react'

export function useCounterAnimation(target, duration = 1500) {
  const [value, setValue] = useState(0)
  const frameRef = useRef()

  useEffect(() => {
    if (target <= 0) { setValue(0); return }
    setValue(0)
    let startTime = null
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 4)
      setValue(target * eased)
      if (progress < 1) frameRef.current = requestAnimationFrame(animate)
    }
    frameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameRef.current)
  }, [target, duration])

  return value
}
