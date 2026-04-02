import { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import ItemCard from './ItemCard'

const INITIAL_BATCH = 50
const LOAD_MORE = 50
const ANIMATE_COUNT = 12

export default function Sidebar({
  currentTab,
  items,
  searchQuery,
  onSearchChange,
  selectedItemId,
  onSelectItem,
}) {
  const [renderCount, setRenderCount] = useState(INITIAL_BATCH)
  const listRef = useRef(null)

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items
    const query = searchQuery.toLowerCase()
    return items.filter(item => item.title.toLowerCase().includes(query))
  }, [items, searchQuery])

  // Reset batch size when list changes
  useEffect(() => {
    setRenderCount(INITIAL_BATCH)
  }, [items, searchQuery])

  // Auto-select first item if none is selected
  useEffect(() => {
    if (!selectedItemId && filteredItems.length > 0) {
      onSelectItem(filteredItems[0].id)
    }
  }, [filteredItems, selectedItemId, onSelectItem])

  const handleScroll = useCallback(() => {
    const el = listRef.current
    if (!el) return
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 200) {
      setRenderCount(prev => Math.min(prev + LOAD_MORE, filteredItems.length))
    }
  }, [filteredItems.length])

  const visibleItems = filteredItems.slice(0, renderCount)
  const tabLabel = currentTab.charAt(0).toUpperCase() + currentTab.slice(1)

  return (
    <div className="sidebar">
      <h2>{tabLabel}</h2>
      <div className="items-list" ref={listRef} onScroll={handleScroll}>
        {filteredItems.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
            {items.length === 0
              ? `No ${currentTab} available`
              : `No ${currentTab} match your search`}
          </p>
        ) : (
          visibleItems.map((item, index) => (
            <ItemCard
              key={item.id}
              item={item}
              isSelected={item.id === selectedItemId}
              onClick={() => onSelectItem(item.id)}
              currentTab={currentTab}
              style={index < ANIMATE_COUNT
                ? { animationDelay: `${index * 0.04}s` }
                : { opacity: 1, animation: 'none' }}
            />
          ))
        )}
      </div>
    </div>
  )
}
