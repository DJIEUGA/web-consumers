import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';

type Props = {
  children: React.ReactNode;
};

const ProtectedRoute: React.FC<Props> = ({children}) => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/connexion" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
