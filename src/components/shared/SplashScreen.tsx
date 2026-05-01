import React, { useEffect, useState } from 'react';
import './SplashScreen.css';

const SplashScreen: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // We handle the actual removal in the parent (App.tsx), 
    // but we can add a local fade-out class just before it's removed.
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000); // Start fade out slightly before the parent removes it

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`splash-screen ${!isVisible ? 'fade-out' : ''}`}>
      <div className="splash-content">
        <img 
          src="/logo-animation.gif" 
          alt="Jobty Loading..." 
          className="splash-logo"
        />
      </div>
    </div>
  );
};

export default SplashScreen;
