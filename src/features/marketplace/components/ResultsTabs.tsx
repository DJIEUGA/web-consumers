import React from 'react';

type ResultsTab = 'pros' | 'enterprises';

type ResultsTabsProps = {
  activeTab: ResultsTab;
  prosCount: number;
  enterprisesCount: number;
  onTabChange: (tab: ResultsTab) => void;
};

const ResultsTabs: React.FC<ResultsTabsProps> = ({
  activeTab,
  prosCount,
  enterprisesCount,
  onTabChange,
}) => {
  const items: Array<{ key: ResultsTab; label: string; count: number }> = [
    { key: 'pros', label: 'Pros', count: prosCount },
    { key: 'enterprises', label: 'Entreprises', count: enterprisesCount },
  ];

  return (
    <div className="marketplace-tabs" role="tablist" aria-label="Types de resultats">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          role="tab"
          aria-selected={activeTab === item.key}
          className={`marketplace-tab ${activeTab === item.key ? 'active' : ''}`}
          onClick={() => onTabChange(item.key)}
        >
          {item.label}
          <span className="marketplace-tab-count">{item.count}</span>
        </button>
      ))}
    </div>
  );
};

export default ResultsTabs;
