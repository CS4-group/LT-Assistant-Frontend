import { useState, useRef, useEffect } from 'react'

export default function SearchableDropdown({ items, placeholder, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const containerRef = useRef()
  const searchRef = useRef()

  const filtered = items.filter(item =>
    item.label.toLowerCase().includes(searchText.toLowerCase())
  )

  const selectedLabel = items.find(i => String(i.value) === String(value))?.label || placeholder

  useEffect(() => {
    const handleClick = (e) => {
      if (!containerRef.current?.contains(e.target)) setIsOpen(false)
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  useEffect(() => {
    if (isOpen && searchRef.current) searchRef.current.focus()
  }, [isOpen])

  return (
    <div ref={containerRef} className="custom-dropdown">
      <div
        className={`dropdown-selected ${isOpen ? 'open' : ''}`}
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen) }}
      >
        {selectedLabel}
      </div>
      {isOpen && (
        <div className="dropdown-container open">
          <div className="dropdown-search">
            <input
              ref={searchRef}
              type="text"
              placeholder="Type to search..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              onClick={e => e.stopPropagation()}
            />
          </div>
          <div className="dropdown-list">
            {filtered.length === 0 ? (
              <div className="dropdown-item no-results">No results found</div>
            ) : filtered.map(item => (
              <div
                key={item.value}
                className={`dropdown-item ${String(item.value) === String(value) ? 'selected' : ''}`}
                onClick={(e) => {
                  e.stopPropagation()
                  onChange(item.value)
                  setIsOpen(false)
                  setSearchText('')
                }}
              >
                {item.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
