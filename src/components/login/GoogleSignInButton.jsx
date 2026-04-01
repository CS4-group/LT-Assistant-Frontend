import { useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'

export default function GoogleSignInButton() {
  const containerRef = useRef()
  const { handleGoogleSignIn } = useAuth()

  useEffect(() => {
    window.handleGoogleSignIn = (response) => handleGoogleSignIn(response)

    const initGSI = () => {
      if (window.google?.accounts?.id && containerRef.current) {
        window.google.accounts.id.initialize({
          client_id: '1076207663943-9urdbi6g6fbnblt45kbdr6h3tn32p653.apps.googleusercontent.com',
          callback: window.handleGoogleSignIn,
        })
        window.google.accounts.id.renderButton(containerRef.current, {
          type: 'standard', size: 'large', theme: 'outline',
          text: 'sign_in_with', shape: 'rectangular',
          logo_alignment: 'left', width: 350,
        })
      }
    }

    if (window.google?.accounts?.id) {
      initGSI()
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) { clearInterval(interval); initGSI() }
      }, 100)
      return () => clearInterval(interval)
    }
  }, [handleGoogleSignIn])

  return <div ref={containerRef} className="g_id_signin" />
}
