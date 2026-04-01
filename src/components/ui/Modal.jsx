import { useEffect, useRef, useState } from 'react'

export default function Modal({ children, onClose }) {
  const [closing, setClosing] = useState(false)
  const overlayRef = useRef()

  const handleClose = () => {
    setClosing(true)
    setTimeout(() => onClose(), 300)
  }

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) handleClose()
  }

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') handleClose() }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [])

  return (
    <div
      ref={overlayRef}
      className={`modal-overlay ${closing ? 'closing' : ''}`}
      onClick={handleOverlayClick}
    >
      <div className="modal-content">
        {typeof children === 'function' ? children(handleClose) : children}
      </div>
    </div>
  )
}
