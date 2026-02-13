import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import logo from '../assets/logo.png';
import './home.css';

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

          {/* Image au-dessus du logo - Collez votre lien ici */}
          <div className="hero-image-container">
            <img 
              src="illustration.png"  /* ← Collez votre lien ici */
              alt="Hero"
              className="hero-image"
            />
          </div>

          {/* Logo Jobty */}
          <div className="logo-container">
            <img src={logo} alt="Jobty" className="logo-image" />
          </div>

          {/* Barre de recherche */}
          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-bar">
              <input
                type="text"
                placeholder={placeholderText}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="search-input-unified"
                autoComplete="off"
                aria-label="Recherche"
              />
              <button 
                type="submit"
                className="search-button"
                aria-label="Rechercher"
              >
                <FiSearch className="search-button-icon" />
              </button>
            </div>
          </form>

          {/* Boutons d'action */}
          <div className="action-buttons">
            <button 
              className="action-btn"
              onClick={() => navigate('/decouverte')}
            >
              Découvrir
            </button>
            <button 
              className="action-btn"
              onClick={() => navigate('/connexion')}
            >
              Connexion
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}

export default Home;