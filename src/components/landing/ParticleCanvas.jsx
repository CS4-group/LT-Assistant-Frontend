import { useRef } from 'react'
import { useParticleCanvas } from '../../hooks/useParticleCanvas'

export default function ParticleCanvas() {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  useParticleCanvas(canvasRef, containerRef)
  return (
    <div ref={containerRef} className="hero-fluid-canvas-container">
      <canvas ref={canvasRef} className="hero-fluid-canvas" />
    </div>
  )
}
