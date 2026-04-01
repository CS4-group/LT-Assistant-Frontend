import { useState } from 'react'
import { useApi } from '../../hooks/useApi'
import { formatTimeAgo } from '../../utils/formatTimeAgo'

export default function ReviewCard({ review, style }) {
  const { post, del } = useApi()
  const [liked, setLiked] = useState(review.liked || false)
  const [likeCount, setLikeCount] = useState(review.likes || 0)
  const [imgError, setImgError] = useState(false)

  const handleLike = async () => {
    const wasLiked = liked
    // Optimistic update
    setLiked(!wasLiked)
    setLikeCount(prev => wasLiked ? prev - 1 : prev + 1)

    try {
      if (wasLiked) {
        await del(`/api/reviews/${review.id}/like`)
      } else {
        await post(`/api/reviews/${review.id}/like`)
      }
    } catch {
      // Revert on failure
      setLiked(wasLiked)
      setLikeCount(prev => wasLiked ? prev + 1 : prev - 1)
    }
  }

  const userName = review.userName || review.user?.name || 'Anonymous'
  const userPicture = review.userPicture || review.user?.picture || ''
  const initial = userName.charAt(0).toUpperCase()

  const stars = Array.from({ length: 5 }, (_, i) =>
    i < review.rating ? '\u2605' : '\u2606'
  ).join('')

  return (
    <div className="review-card" style={style}>
      <div className="review-header">
        <div className="review-user">
          {userPicture && !imgError ? (
            <img
              className="review-avatar"
              src={userPicture}
              alt={userName}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="review-avatar-fallback">{initial}</div>
          )}
          <div className="review-user-info">
            <strong>{userName}</strong>
            <span className="review-timestamp">
              {review.createdAt ? formatTimeAgo(review.createdAt) : ''}
            </span>
          </div>
        </div>
        <div className="review-rating">{stars}</div>
      </div>
      <p>{review.text || review.comment || ''}</p>
      <div className="review-votes">
        <button
          className={`like-btn${liked ? ' liked' : ''}`}
          onClick={handleLike}
        >
          {liked ? '\u2764' : '\u2661'}{' '}
          <span className="like-count">{likeCount}</span>
        </button>
      </div>
    </div>
  )
}
