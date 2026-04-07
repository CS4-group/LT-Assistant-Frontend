export default function ItemCard({ item, isSelected, onClick, currentTab, style, onMouseEnter }) {
  let description
  switch (currentTab) {
    case 'courses':
      description = 'Click to view details'
      break
    case 'clubs':
      description = item.meetingDay || item.description || 'Click to view details'
      break
    case 'teachers':
      description = item.description || 'Click to view details'
      break
    default:
      description = 'Click to view details'
  }

  return (
    <div
      className={`item-card${isSelected ? ' selected' : ''}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      style={style}
    >
      <div className="selection-bg" />
      <div className="item-title">{item.title}</div>
      <div className="item-description">{description}</div>
    </div>
  )
}
