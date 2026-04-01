export default function ReviewFilterSelect({ value, onChange }) {
  return (
    <select className="sort-select" value={value} onChange={e => onChange(e.target.value)}>
      <option value="all">All Ratings</option>
      <option value="5">5 Stars</option>
      <option value="4">4 Stars</option>
      <option value="3">3 Stars</option>
      <option value="2">2 Stars</option>
      <option value="1">1 Star</option>
    </select>
  )
}
