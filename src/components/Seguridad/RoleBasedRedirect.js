import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const RoleBasedRedirect = ({ token, children }) => {
  const user = jwtDecode(token);

  if (user.userRole === 'Gestor') {
    return <Navigate to="/user-roles" />;
  } else if (user.userRole === 'Operador') {
    return <Navigate to="/landing-page" />;
  }

  return children;
};

export default RoleBasedRedirect;
