export default function OptionCard({ label, sub, selected, onClick, wide }) {
  return (
    <button
      className={`option-card ${selected ? 'selected' : ''} ${wide ? 'option-card-wide' : ''}`}
      onClick={onClick}
    >
      <span className="option-label">{label}</span>
      {sub && <span className="option-sub">{sub}</span>}
    </button>
  )
}
