import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import LightningContainer from './components/LightningContainer';

function App() {
  const [emailInput, setEmailInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [sfSession, setSfSession] = useState({
    isAuthenticated: false,
    accessToken: null,
    instanceUrl: null,
    frontdoorUrl: null
  });

  const handleSilentSSO = useCallback(async (email) => {
    if (!email) return;
    setLoading(true);
    setErrorMsg("");

    try {
      const response = await axios.post('/api/sso-login', { email });
      if (response.data.success) {
        setSfSession({
          isAuthenticated: true,
          accessToken: response.data.accessToken,
          instanceUrl: response.data.instanceUrl,
          frontdoorUrl: response.data.frontdoorUrl
        });
      } else {
        setErrorMsg(response.data.message || "Login failed.");
      }
    } catch (err) {
      setErrorMsg("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      // Clear URL and grab saved email to attempt restoration
      window.history.replaceState({}, document.title, window.location.pathname);
      const savedEmail = localStorage.getItem('last_login_email');
      if (savedEmail) {
        handleSilentSSO(savedEmail);
      }
    }
  }, [handleSilentSSO]);

  const onLoginClick = () => {
    localStorage.setItem('last_login_email', emailInput);
    handleSilentSSO(emailInput);
  };

  if (sfSession.isAuthenticated) {
    return (
      <div style={ { textAlign: 'center', marginTop: '50px' } }>
        <h1>✅ Session Authenticated</h1>
        <LightningContainer frontdoorUrl={ sfSession.frontdoorUrl } />
      </div>
    );
  }

  return (
    <div style={ { textAlign: 'center', marginTop: '50px' } }>
      <h2>SSO + Lightning 2.0</h2>
      <input
        type="email"
        value={ emailInput }
        onChange={ (e) => setEmailInput(e.target.value) }
        placeholder="Enter email"
        style={ { padding: '10px', width: '250px' } }
      />
      <button onClick={ onLoginClick } disabled={ loading } style={ { padding: '10px 20px', marginLeft: '10px' } }>
        { loading ? "Loading..." : "Log In" }
      </button>
      { errorMsg && <p style={ { color: 'red', marginTop: '10px' } }>{ errorMsg }</p> }
    </div>
  );
}

export default App;