interface TabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: { id: string; label: string }[];
}

export const TabBar = ({ activeTab, onTabChange, tabs }: TabBarProps) => {
  return (
    <div style={{ 
      display: 'flex', 
      gap: '1rem', 
      marginBottom: '2rem',
      borderBottom: '1px solid #eaeaea',
      padding: '1rem'
    }}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}; 