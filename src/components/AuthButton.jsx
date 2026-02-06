// src/components/AuthButton.jsx
import React from 'react';
import { useOktaAuth } from '@okta/okta-react';

const AuthButton = () => {
  const { oktaAuth, authState } = useOktaAuth();

  if (!authState) {
    return <div>Loading...</div>;
  }

  const handleLogin = async () => await oktaAuth.signInWithRedirect();
  const handleLogout = async () => await oktaAuth.signOut();

  return (
    <div>
      {authState.isAuthenticated ? (
        <button onClick={handleLogout}>Logout</button>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
};

export default AuthButton;