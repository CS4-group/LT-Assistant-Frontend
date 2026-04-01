import { useRef, useEffect } from 'react'

export function useDragAndDrop(containerRef, onSwap) {
  const dragDataRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const onDragStart = (e) => {
      const card = e.target.closest('.course-card[draggable="true"]')
      if (!card) return
      dragDataRef.current = {
        id: card.dataset.courseId,
        year: card.dataset.year,
        term: card.dataset.term,
        periodIdx: parseInt(card.dataset.periodIdx)
      }
      requestAnimationFrame(() => card.classList.add('dragging'))
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', JSON.stringify(dragDataRef.current))
    }

    const onDragEnd = () => {
      container.querySelectorAll('.dragging, .drag-over').forEach(el =>
        el.classList.remove('dragging', 'drag-over')
      )
      dragDataRef.current = null
    }

    const onDragOver = (e) => {
      const slot = e.target.closest('.course-card, .empty-half, .empty-slot')
      if (!slot || !dragDataRef.current) return
      e.preventDefault()
      container.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'))
      slot.classList.add('drag-over')
    }

    const onDragLeave = (e) => {
      if (!container.contains(e.relatedTarget)) {
        container.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'))
      }
    }

    const onDrop = (e) => {
      e.preventDefault()
      const slot = e.target.closest('.course-card, .empty-half, .empty-slot')
      if (!slot || !dragDataRef.current) return
      container.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'))

      const { term: srcTerm, periodIdx: srcIdx } = dragDataRef.current
      const tgtTerm = slot.dataset.term
      const tgtIdx = parseInt(slot.dataset.periodIdx)

      if (!tgtTerm || isNaN(tgtIdx) || (srcTerm === tgtTerm && srcIdx === tgtIdx)) return
      onSwap(srcTerm, srcIdx, tgtTerm, tgtIdx)
    }

    container.addEventListener('dragstart', onDragStart)
    container.addEventListener('dragend', onDragEnd)
    container.addEventListener('dragover', onDragOver)
    container.addEventListener('dragleave', onDragLeave)
    container.addEventListener('drop', onDrop)

    return () => {
      container.removeEventListener('dragstart', onDragStart)
      container.removeEventListener('dragend', onDragEnd)
      container.removeEventListener('dragover', onDragOver)
      container.removeEventListener('dragleave', onDragLeave)
      container.removeEventListener('drop', onDrop)
    }
  }, [containerRef, onSwap])
}
