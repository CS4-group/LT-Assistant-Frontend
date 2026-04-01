import { useEffect, useMemo } from 'react'
import ItemCard from './ItemCard'

export default function Sidebar({
  currentTab,
  items,
  searchQuery,
  onSearchChange,
  selectedItemId,
  onSelectItem,
}) {
  const filteredItems = useMemo(() => {
    if (!searchQuery) return items
    const query = searchQuery.toLowerCase()
    return items.filter(item => item.title.toLowerCase().includes(query))
  }, [items, searchQuery])

  // Auto-select first item if none is selected
  useEffect(() => {
    if (!selectedItemId && filteredItems.length > 0) {
      onSelectItem(filteredItems[0].id)
    }
  }, [filteredItems, selectedItemId, onSelectItem])

  const tabLabel = currentTab.charAt(0).toUpperCase() + currentTab.slice(1)

  return (
    <div className="sidebar">
      <h2>{tabLabel}</h2>
      <div className="items-list">
        {filteredItems.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
            {items.length === 0
              ? `No ${currentTab} available`
              : `No ${currentTab} match your search`}
          </p>
        ) : (
          filteredItems.map((item, index) => (
            <ItemCard
              key={item.id}
              item={item}
              isSelected={item.id === selectedItemId}
              onClick={() => onSelectItem(item.id)}
              currentTab={currentTab}
              style={{ animationDelay: `${Math.min(index * 0.04, 0.8)}s` }}
            />
          ))
        )}
      </div>
    </div>
  )
}
