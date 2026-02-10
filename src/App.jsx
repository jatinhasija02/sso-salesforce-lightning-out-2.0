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
      console.log(`🚀 Requesting fresh Salesforce session for: ${email}`);
      const response = await axios.post('/api/sso-login', { email });

      if (response.data.success) {
        setSfSession({
          isAuthenticated: true,
          accessToken: response.data.accessToken,
          instanceUrl: response.data.instanceUrl,
          frontdoorUrl: response.data.frontdoorUrl
        });
      } else {
        setErrorMsg(response.data.message || "Salesforce handshake failed.");
      }
    } catch (err) {
      setErrorMsg("Connection error to backend.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      console.log("✅ Returned from Auth0. Checking session...");
      // Clean URL immediately
      window.history.replaceState({}, document.title, window.location.pathname);

      const savedEmail = localStorage.getItem('last_login_email');
      const retryMark = localStorage.getItem('sso_retry_active');

      if (retryMark === 'active') {
        // If we already tried the redirect once and we are back here, 
        // it means the CSP error is still blocking Salesforce.
        setErrorMsg("Salesforce is still blocking the connection (CSP frame-ancestors 'none'). Please update Salesforce Setup.");
        localStorage.removeItem('sso_retry_active');
      } else if (savedEmail) {
        // First time coming back, try to load the bridge
        localStorage.setItem('sso_retry_active', 'active');
        handleSilentSSO(savedEmail);
      }
    }
  }, [handleSilentSSO]);

  const onLoginClick = () => {
    if (!emailInput) return;
    localStorage.setItem('last_login_email', emailInput);
    localStorage.setItem('sso_retry_active', 'none');
    handleSilentSSO(emailInput);
  };

  if (sfSession.isAuthenticated) {
    return (
      <div style={ { textAlign: 'center', marginTop: '50px' } }>
        <h1>✅ Handshake Success</h1>
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
        placeholder="user@example.com"
        style={ { padding: '10px', width: '250px' } }
      />
      <button onClick={ onLoginClick } disabled={ loading } style={ { padding: '10px 20px', marginLeft: '10px' } }>
        { loading ? "Verifying..." : "Log In" }
      </button>
      { errorMsg && (
        <div style={ { color: 'red', marginTop: '20px', border: '1px solid red', padding: '15px' } }>
          <p><strong>Security Error:</strong> { errorMsg }</p>
        </div>
      ) }
    </div>
  );
}

export default App;