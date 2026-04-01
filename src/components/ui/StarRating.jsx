import { useState } from 'react'

export default function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0)
  const display = hover || value

  return (
    <div className="star-rating" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map(i => (
        <span
          key={i}
          className={`star ${i <= display ? 'filled' : ''}`}
          onMouseEnter={() => setHover(i)}
          onClick={() => onChange(i)}
        >
          {i <= display ? '\u2605' : '\u2606'}
        </span>
      ))}
    </div>
  )
}
