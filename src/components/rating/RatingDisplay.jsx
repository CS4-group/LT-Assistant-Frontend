import { useCounterAnimation } from '../../hooks/useCounterAnimation'

export default function RatingDisplay({ rating, totalReviews }) {
  const animatedValue = useCounterAnimation(rating)
  const fullStars = Math.round(rating)

  const stars = Array.from({ length: 5 }, (_, i) =>
    i < fullStars ? '\u2605' : '\u2606'
  ).join('')

  return (
    <div className="rating-display-container">
      <div className="rating-number-wrapper">
        <span className="rating-display-number">{animatedValue.toFixed(1)}</span>
        <span className="rating-max"> / 5.0</span>
      </div>
      <span className="rating-display-stars">{stars}</span>
      <span className="rating-count">
        {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
      </span>
    </div>
  )
}
