import { useTheme } from '../../contexts/ThemeContext'

export default function ThemeToggle({ hidden = false }) {
  const { toggleTheme } = useTheme()

  return (
    <button
      className="theme-toggle"
      aria-label="Toggle Dark Mode"
      onClick={toggleTheme}
      style={hidden ? { display: 'none' } : undefined}
    >
      <svg className="theme-icon" viewBox="0 0 24 24" fill="none" width="24" height="24">
        <mask id="moon-mask">
          <rect x="0" y="0" width="100%" height="100%" fill="white" />
          <circle className="moon-cutout" cx="24" cy="10" r="6" fill="black" />
        </mask>
        <circle className="sun-core" cx="12" cy="12" r="6" mask="url(#moon-mask)" fill="currentColor" />
        <g className="sun-rays" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </g>
      </svg>
    </button>
  )
}
