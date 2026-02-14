import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import './home.css';

import SearchBar from '../components/shared/SearchBar';
import Header from '../components/shared/Header';
import Footer from '../components/shared/Footer';

function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [placeholderText, setPlaceholderText] = useState('lieux, secteur d\'activité, ville, quartier...');

  // Animation du placeholder
  useEffect(() => {
    const placeholders = [
      'lieux, secteur d\'activité, ville, quartier...',
      'Plombier à Dakar',
      'Électricien à Abidjan',
      'Développeur à Lagos',
      'Menuisier à Douala',
      'Comptable à Accra'
    ];
    
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % placeholders.length;
      setPlaceholderText(placeholders[index]);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      return;
    }
    
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <div className="home-container">
      <main className="main-content">
        <div className="search-section">

          <div className="hero-image-container">
            <img src="illustration.png" alt="Hero" className="hero-image" />
          </div>

          <div className="logo-container">
            <img src={logo} alt="Jobty" className="logo-image" />
          </div>

          <SearchBar
            value={searchQuery}
            placeholder={placeholderText}
            onChange={setSearchQuery}
            onSearch={() => navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)}
          />

          <div className="action-buttons">
            <button className="action-btn" onClick={() => navigate('/decouverte')}>Découvrir</button>
            <button className="action-btn" onClick={() => navigate('/connexion')}>Connexion</button>
          </div>

        </div>
      </main>
    </div>
  );
}

export default Home;