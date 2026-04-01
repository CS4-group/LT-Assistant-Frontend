export default function TabBar({ currentTab, onTabChange }) {
  const tabs = ['courses', 'clubs', 'teachers']
  return (
    <div className="tab-container">
      {tabs.map(tab => (
        <button
          key={tab}
          className={`tab-button ${currentTab === tab ? 'active' : ''}`}
          onClick={() => onTabChange(tab)}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </div>
  )
}
