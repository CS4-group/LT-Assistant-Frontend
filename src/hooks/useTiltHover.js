import { useEffect } from 'react'

export function useTiltHover(cardRef) {
  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    let targetX = 0, targetY = 0, currX = 0, currY = 0
    let isHovered = false, scale = 1, ty = 0, animFrame = null

    const tick = () => {
      currX += (targetX - currX) * 0.12
      currY += (targetY - currY) * 0.12
      const targetScale = isHovered ? 1.02 : 1
      const targetTy = isHovered ? -8 : 0
      scale += (targetScale - scale) * 0.15
      ty += (targetTy - ty) * 0.15

      card.style.transform = `perspective(1000px) translateY(${ty}px) scale(${scale}) rotateX(${currY}deg) rotateY(${currX}deg)`

      if (!isHovered && Math.abs(currX) < 0.01 && Math.abs(currY) < 0.01 && Math.abs(scale - 1) < 0.001) {
        card.style.transform = ''
        card.style.transition = ''
        animFrame = null
        return
      }
      animFrame = requestAnimationFrame(tick)
    }

    const onEnter = () => {
      isHovered = true
      card.style.transition = 'box-shadow 0.5s ease, border-color 0.4s ease, background-color 0.4s ease'
      if (!animFrame) animFrame = requestAnimationFrame(tick)
    }

    const onMove = (e) => {
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left, y = e.clientY - rect.top
      card.style.setProperty('--mouse-x', `${x}px`)
      card.style.setProperty('--mouse-y', `${y}px`)
      const centerX = rect.width / 2, centerY = rect.height / 2
      targetY = ((y - centerY) / centerY) * -5
      targetX = ((x - centerX) / centerX) * 5
    }

    const onLeave = () => { isHovered = false; targetX = 0; targetY = 0 }

    card.addEventListener('mouseenter', onEnter)
    card.addEventListener('mousemove', onMove)
    card.addEventListener('mouseleave', onLeave)

    return () => {
      card.removeEventListener('mouseenter', onEnter)
      card.removeEventListener('mousemove', onMove)
      card.removeEventListener('mouseleave', onLeave)
      if (animFrame) cancelAnimationFrame(animFrame)
    }
  }, [])
}
