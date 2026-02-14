import React from 'react';
import { FiSearch, FiChevronDown } from 'react-icons/fi';

interface FiltersBarProps {
  filters: Record<string, any>;
  secteurs: string[];
  pays: string[];
  onChange: (name: string, value: any) => void;
  onSubmit: () => void;
}

const FiltersBar: React.FC<FiltersBarProps> = ({ filters, secteurs, pays, onChange, onSubmit }) => {
  return (
    <form className="filters-bar" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
      <div className="filter-item search-input">
        <FiSearch className="filter-icon" />
        <input type="text" name="search" placeholder="Recherchez par mot clé..." value={filters.search} onChange={(e) => onChange('search', e.target.value)} />
      </div>

      <div className="filter-item">
        <select name="secteur" value={filters.secteur} onChange={(e) => onChange('secteur', e.target.value)}>
          {secteurs.map((s, i) => (<option key={i} value={i === 0 ? '' : s}>{s}</option>))}
        </select>
        <FiChevronDown className="select-arrow" />
      </div>

      <div className="filter-item">
        <select name="pays" value={filters.pays} onChange={(e) => onChange('pays', e.target.value)}>
          {pays.map((p, i) => (<option key={i} value={i === 0 ? '' : p}>{p}</option>))}
        </select>
        <FiChevronDown className="select-arrow" />
      </div>

      <div className="filter-item">
        <input type="text" name="ville" placeholder="Toutes les villes" value={filters.ville} onChange={(e) => onChange('ville', e.target.value)} />
      </div>

      <button type="submit" className="filter-btn">Filtrer</button>
    </form>
  );
};

export default FiltersBar;
