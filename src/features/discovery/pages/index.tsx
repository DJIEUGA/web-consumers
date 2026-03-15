import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '@/components/shared/Logo';
import { useAuthStore } from '../../../stores/auth.store';
import { resolveCurrentLocation } from '../utils/location';
import '../styles/Home.css';
import SearchBar from '../../../components/shared/SearchBar';

export const Home = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const authUser = useAuthStore((state) => state.user);
  const getDashboardRoute = useAuthStore((state) => state.getDashboardRoute);
  const [searchQuery, setSearchQuery] = useState('');
  const [placeholderText, setPlaceholderText] = useState('lieux, secteur d\'activité, ville, quartier...');
  const authShortcutLabel = isAuthenticated ? 'Dashboard' : 'Connexion';
  const authShortcutRoute = isAuthenticated ? getDashboardRoute() : '/connexion';

  const goToAuthShortcut = () => {
    navigate(authShortcutRoute, {
      state: !isAuthenticated ? { from: '/' } : undefined,
    });
  };

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

  const handleSearchNavigation = async () => {
    const trimmedQuery = searchQuery.trim();

    if (trimmedQuery) {
      navigate(`/search?q=${encodeURIComponent(trimmedQuery)}&page=0&size=12`);
      return;
    }

    const params = new URLSearchParams({
      page: '0',
      size: '12',
    });

    const location = await resolveCurrentLocation(authUser || undefined);
    if (location) {
      params.set('country', location.country);
      params.set('city', location.city);
    }

    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="home-container">
      <main className="main-content">
        <div className="search-section">

          <div className="hero-image-container">
            <img src="illustration.png" alt="Hero" className="hero-image" />
          </div>

          <div className="logo-container">
            <Logo alt="Jobty" style={{width: '260px'}} />
          </div>

          <SearchBar
            value={searchQuery}
            placeholder={placeholderText}
            onChange={setSearchQuery}
            onSearch={handleSearchNavigation}
          />

          <div className="action-buttons">
            <button className="action-btn" onClick={() => navigate('/decouverte')}>Découvrir</button>
            <button className="action-btn" onClick={goToAuthShortcut}>{authShortcutLabel}</button>
          </div>

        </div>
      </main>
    </div>
  );
}