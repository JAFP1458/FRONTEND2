import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = ({ token, roles, children }) => {
  if (!token) {
    return <Navigate to="/login" />;
  }

  const user = jwtDecode(token);

  if (roles && !roles.includes(user.userRole)) {
    return <Navigate to="/landing-page" />;
  }

  return children;
};

export default ProtectedRoute;
