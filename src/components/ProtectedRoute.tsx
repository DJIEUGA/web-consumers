import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';

type Props = {
  children: React.ReactNode;
};

const ProtectedRoute: React.FC<Props> = ({children}) => {
  const { isAuthenticated, isHydrated } = useAuthStore();

  console.log('[PROTECTED_ROUTE] Render check:', { isAuthenticated, isHydrated });

  // Wait for store to hydrate from localStorage before checking authentication
  if (!isHydrated) {
    console.log('[PROTECTED_ROUTE] Still hydrating, showing loading spinner');
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{
          textAlign: 'center'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #3dc7c9',
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <p style={{ color: '#666' }}>Chargement...</p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('[PROTECTED_ROUTE] Not authenticated, redirecting to /connexion');
    return <Navigate to="/connexion" replace />;
  }

  console.log('[PROTECTED_ROUTE] Authenticated, rendering children');
  return <>{children}</>;
};

export default ProtectedRoute;
