import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiUser } from 'react-icons/fi';
import Logo from './Logo';

interface HeaderProps {
  onOpenMenu?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenMenu }) => {
  const navigate = useNavigate();

  return (
    <header className="marketplace-header">
      <div className="header-content">
        <div className="header-logo" onClick={() => navigate('/')}> 
          <Logo alt="Jobty" />
        </div>

        <nav className="header-nav desktop-nav">
          <a href="/decouverte" onClick={(e) => { e.preventDefault(); navigate('/decouverte'); }} className="nav-item">Découverte</a>
          <a href="/marketplace" onClick={(e) => { e.preventDefault(); navigate('/marketplace'); }} className="nav-item">Marketplace</a>
          <a href="/portfolio" onClick={(e) => { e.preventDefault(); navigate('/portfolio'); }} className="nav-item">Portfolio</a>
          <a href="/localisation" onClick={(e) => { e.preventDefault(); navigate('/localisation'); }} className="nav-item">Localisation</a>
          <a href="/job-alerte" onClick={(e) => { e.preventDefault(); navigate('/job-alerte'); }} className="nav-item">Job alerte</a>
        </nav>

        <div className="header-actions">
          <div className="profile-icon" onClick={() => navigate('/connexion')}> 
            <FiUser />
            <span className="notification-badge">0</span>
          </div>

          <button className="burger-btn" onClick={onOpenMenu} aria-label="Menu">
            <FiMenu />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
