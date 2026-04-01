import { useState, useEffect, useRef } from 'react'
import Modal from '../ui/Modal'
import SearchableDropdown from '../ui/SearchableDropdown'
import StarRating from '../ui/StarRating'
import { useApi } from '../../hooks/useApi'
import { useToast } from '../../contexts/ToastContext'
import { filterBadWords, containsBadWords } from '../../utils/badWordFilter'

export default function AddReviewModal({
  currentTab,
  items,
  selectedItemId,
  onClose,
  onSubmitted,
}) {
  const { post } = useApi()
  const { showToast } = useToast()

  const [selectedItem, setSelectedItem] = useState(selectedItemId || '')
  const [rating, setRating] = useState(0)
  const [text, setText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [badWordWarning, setBadWordWarning] = useState(false)
  const warningTimerRef = useRef(null)

  // Pre-select current item when selectedItemId changes
  useEffect(() => {
    if (selectedItemId) {
      setSelectedItem(selectedItemId)
    }
  }, [selectedItemId])

  const dropdownItems = items.map(item => ({
    value: item.id,
    label: item.title,
  }))

  const entityType = currentTab === 'courses' ? 'course'
    : currentTab === 'clubs' ? 'club'
    : 'teacher'

  const handleTextChange = (e) => {
    const raw = e.target.value
    const filtered = filterBadWords(raw)
    setText(filtered)

    if (containsBadWords(raw)) {
      setBadWordWarning(true)
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current)
      warningTimerRef.current = setTimeout(() => setBadWordWarning(false), 3000)
    }
  }

  useEffect(() => {
    return () => {
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current)
    }
  }, [])

  const canSubmit = selectedItem && rating > 0 && text.trim().length > 0 && !containsBadWords(text) && !isSubmitting

  const handleSubmit = async () => {
    if (!canSubmit) return
    setIsSubmitting(true)
    try {
      await post('/api/reviews', {
        entityType,
        entityId: selectedItem,
        rating,
        text: text.trim(),
      })
      showToast('Review submitted successfully!', 'success')
      if (onSubmitted) onSubmitted()
      onClose()
    } catch (err) {
      console.error('Failed to submit review:', err)
      showToast('Failed to submit review. Please try again.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal onClose={onClose}>
      {(handleClose) => (
        <>
          <div className="modal-header">
            <h2>Add Review</h2>
            <button className="modal-close" onClick={handleClose}>&times;</button>
          </div>
          <div className="modal-body">
            <div className="form">
              <div className="form-group">
                <label className="form-label">
                  {currentTab === 'courses' ? 'Course' : currentTab === 'clubs' ? 'Club' : 'Teacher'}
                </label>
                <SearchableDropdown
                  items={dropdownItems}
                  placeholder={`Select a ${entityType}...`}
                  value={selectedItem}
                  onChange={setSelectedItem}
                />
              </div>

              <div className="form-group rating-form-group">
                <label className="form-label">Rating</label>
                <StarRating value={rating} onChange={setRating} />
              </div>

              <div className="form-group">
                <label className="form-label">Your Review</label>
                <textarea
                  className="form-input review-textarea"
                  placeholder="Share your experience..."
                  value={text}
                  onChange={handleTextChange}
                  rows={4}
                />
                {badWordWarning && (
                  <div className="filter-warning">
                    Inappropriate language has been filtered.
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-outline" onClick={handleClose}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </>
      )}
    </Modal>
  )
}
