import React from 'react';
import { FiSearch } from 'react-icons/fi';

interface SearchBarProps {
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
  onSearch: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, placeholder = 'Recherchez...', onChange, onSearch }) => {
  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onSearch();
  };

  return (
    <form className="search-form" onSubmit={(e) => { e.preventDefault(); onSearch(); }}>
      <div className="search-bar">
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKey}
          className="search-input-unified"
          autoComplete="off"
          aria-label="Recherche"
        />
        <button type="submit" className="search-button" aria-label="Rechercher">
          <FiSearch className="search-button-icon" />
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
