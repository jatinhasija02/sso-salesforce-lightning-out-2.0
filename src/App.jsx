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

  // Function to handle the Salesforce SSO login
  const handleSilentSSO = useCallback(async (email) => {
    if (!email) return;
    setLoading(true);
    setErrorMsg("");

    try {
      console.log(`🚀 Initiating Handshake for: ${email}`);
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
      console.error("SSO Connection Error:", err);
      setErrorMsg("Failed to connect to Salesforce backend.");
    } finally {
      setLoading(false);
    }
  }, []);

  // --- THE FIX: AUTO-PROCESS AUTH0 CODE ON LOAD ---
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      console.log("Found Auth0 Code in URL. Restoring session...");

      // 1. Clean the URL so the user doesn't see the code
      window.history.replaceState({}, document.title, window.location.pathname);

      // 2. Retrieve the email we saved before the redirect
      const savedEmail = localStorage.getItem('last_login_email');

      if (savedEmail) {
        handleSilentSSO(savedEmail);
      } else {
        setErrorMsg("Session restored but user email lost. Please log in again.");
      }
    }
  }, [handleSilentSSO]);

  const onLoginClick = () => {
    if (!emailInput) return setErrorMsg("Please enter an email.");
    // Save email to localStorage so we remember it after the Auth0 redirect
    localStorage.setItem('last_login_email', emailInput);
    handleSilentSSO(emailInput);
  };

  // --- RENDER ---
  if (sfSession.isAuthenticated) {
    return (
      <div style={ { textAlign: 'center', marginTop: '50px' } }>
        <h1 style={ { color: 'green' } }>✅ Session Active</h1>
        <LightningContainer frontdoorUrl={ sfSession.frontdoorUrl } />
        <button
          onClick={ () => setSfSession({ isAuthenticated: false }) }
          style={ { marginTop: '20px', padding: '10px' } }
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div style={ { textAlign: 'center', marginTop: '50px' } }>
      <h2>SSO + Lightning 2.0</h2>
      { loading ? (
        <div>
          <p>🔄 Please wait, securing your connection...</p>
        </div>
      ) : (
        <>
          <input
            type="email"
            value={ emailInput }
            onChange={ (e) => setEmailInput(e.target.value) }
            placeholder="user@example.com"
            style={ { padding: '10px', width: '250px', marginRight: '10px' } }
          />
          <button onClick={ onLoginClick } style={ { padding: '10px 20px' } }>
            Log In
          </button>
        </>
      ) }
      { errorMsg && <p style={ { color: 'red', marginTop: '10px' } }>{ errorMsg }</p> }
    </div>
  );
}

export default App;