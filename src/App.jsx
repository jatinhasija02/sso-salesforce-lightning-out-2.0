import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import LightningContainer from './components/LightningContainer';

function App() {
  const [emailInput, setEmailInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [sfSession, setSfSession] = useState({ isAuthenticated: false, frontdoorUrl: null });

  const getSalesforceSession = useCallback(async (email) => {
    if (!email) return;
    setLoading(true);
    console.log(`[LOG] 🛰️ Fetching Frontdoor for: ${email}`);
    try {
      const response = await axios.post('/api/sso-login', { email });
      if (response.data.success) {
        console.log("[LOG] ✅ Frontdoor URL Generated");
        setSfSession({ isAuthenticated: true, frontdoorUrl: response.data.frontdoorUrl });
      } else {
        setErrorMsg(response.data.message || "Salesforce session failed.");
      }
    } catch (err) {
      setErrorMsg("Backend connection failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const savedEmail = localStorage.getItem('last_login_email');

    if (code && savedEmail) {
      console.log("[LOG] ✅ Auth0 Code Detected. Cleaning URL and fetching session...");
      // 1. Remove code from URL immediately to prevent re-processing
      window.history.replaceState({}, document.title, window.location.pathname);

      // 2. Fetch the session
      getSalesforceSession(savedEmail);
    }
  }, [getSalesforceSession]);

  const onLoginClick = () => {
    if (!emailInput) return;
    localStorage.setItem('last_login_email', emailInput);
    // Reset retry flag on manual login
    sessionStorage.removeItem('sso_retry_active');
    getSalesforceSession(emailInput);
  };

  if (sfSession.isAuthenticated) {
    return (
      <div style={ { textAlign: 'center', marginTop: '50px' } }>
        <h1 style={ { color: 'green' } }>✅ Session Active</h1>
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
        placeholder="email@example.com"
        style={ { padding: '10px', width: '250px' } }
      />
      <button onClick={ onLoginClick } disabled={ loading } style={ { padding: '10px 20px', marginLeft: '10px' } }>
        { loading ? "Authenticating..." : "Log In" }
      </button>
      { errorMsg && (
        <div style={ { color: 'red', marginTop: '20px', border: '1px solid red', padding: '10px' } }>
          <p><strong>{ errorMsg }</strong></p>
        </div>
      ) }
    </div>
  );
}

export default App;