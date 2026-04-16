import React from 'react';
import { useNavigate } from 'react-router-dom';

const Footer: React.FC = () => {
  const navigate = useNavigate();

  return (
    <footer className="marketplace-footer">
      <div className="footer-content">
        <div className="footer-column">
          <h4 className="footer-column-title">Navigation</h4>
          <ul className="footer-links">
            <li><a href="/decouverte" onClick={(e) => { e.preventDefault(); navigate('/decouverte'); }}>Découvrir</a></li>
            <li><a href="/marketplace" onClick={(e) => { e.preventDefault(); navigate('/marketplace'); }}>Marketplace</a></li>
            <li><a href="/portfolio" onClick={(e) => { e.preventDefault(); navigate('/portfolio'); }}>Portfolio</a></li>
            <li><a href="/localisation" onClick={(e) => { e.preventDefault(); navigate('/localisation'); }}>Localisation</a></li>
            <li><a href="/job-alerte" onClick={(e) => { e.preventDefault(); navigate('/job-alerte'); }}>Job alerte</a></li>
            <li><a href="/job-experience" onClick={(e) => { e.preventDefault(); navigate('/job-experience'); }}>Job expérience</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4 className="footer-column-title">À propos</h4>
          <ul className="footer-links">
            <li><a href="/comment-ca-marche" onClick={(e) => { e.preventDefault(); navigate('/comment-ca-marche'); }}>Comment ça marche</a></li>
            <li><a href="/devenir-jobeur" onClick={(e) => { e.preventDefault(); navigate('/devenir-jobeur'); }}>Devenir Jobeur</a></li>
            <li><a href="/nous-joindre" onClick={(e) => { e.preventDefault(); navigate('/nous-joindre'); }}>Nous Joindre</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4 className="footer-column-title">Légal</h4>
          <ul className="footer-links">
            <li><a href="/blog" onClick={(e) => { e.preventDefault(); navigate('/blog'); }}>Blog</a></li>
            <li><a href="/conditions" onClick={(e) => { e.preventDefault(); navigate('/conditions'); }}>Conditions d'utilisation</a></li>
            <li><a href="/parametres" onClick={(e) => { e.preventDefault(); navigate('/parametres'); }}>Paramètres</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-copyright">
          <p>© 2024 Jobty - Tous droits réservés</p>
        </div>
        <div className="footer-social">
          <a href="https://facebook.com/" className="social-icon" aria-label="Facebook" target="_blank" rel="noopener noreferrer">f</a>
          <a href="https://instagram.com/" className="social-icon" aria-label="Instagram" target="_blank" rel="noopener noreferrer">📷</a>
          <a href="https://wa.me/" className="social-icon" aria-label="WhatsApp" target="_blank" rel="noopener noreferrer">💬</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
