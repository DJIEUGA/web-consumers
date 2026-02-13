import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';

type Props = {
  children: React.ReactNode;
  allowedRoles?: string[];
};

const ProtectedRoute: React.FC<Props> = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, role } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/connexion" replace />;

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) return <Navigate to="/" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
