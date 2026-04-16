import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '@/components/shared/Logo';

interface Props {
  open: boolean;
  onClose?: () => void;
}

const SidebarMenu: React.FC<Props> = ({ open, onClose }) => {
  const navigate = useNavigate();

  return (
    <div className={`sidebar-menu ${open ? 'open' : ''}`}>
      <div className="sidebar-header">
        <Logo alt="Jobty" className="sidebar-logo" />
        <button className="close-btn" onClick={onClose} aria-label="Fermer">✕</button>
      </div>

      <nav className="sidebar-nav">
        <a href="/decouverte" onClick={(e) => { e.preventDefault(); navigate('/decouverte'); onClose?.(); }}>Découverte</a>
        <a href="/marketplace" onClick={(e) => { e.preventDefault(); navigate('/marketplace'); onClose?.(); }}>Marketplace</a>
        <a href="/portfolio" onClick={(e) => { e.preventDefault(); navigate('/portfolio'); onClose?.(); }}>Portfolio</a>
        <a href="/localisation" onClick={(e) => { e.preventDefault(); navigate('/localisation'); onClose?.(); }}>Localisation</a>
        <a href="/job-alerte" onClick={(e) => { e.preventDefault(); navigate('/job-alerte'); onClose?.(); }}>Job alerte</a>
      </nav>

      <button className="sidebar-connexion-btn" onClick={() => { navigate('/connexion'); onClose?.(); }}>Connexion</button>
    </div>
  );
};

export default SidebarMenu;
