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

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      console.log("Found Auth0 Code in URL. Restoring session...");
      window.history.replaceState({}, document.title, window.location.pathname);

      const savedEmail = localStorage.getItem('last_login_email');
      const hasRetried = localStorage.getItem('has_retried') === 'true';

      if (hasRetried) {
        // BREAK THE LOOP: We've already tried a redirect once. 
        // If we are here again, Salesforce is still blocking us.
        setErrorMsg("Salesforce is still blocking the connection (CSP Error). Please check your SF Setup.");
        localStorage.removeItem('has_retried');
      } else if (savedEmail) {
        localStorage.setItem('has_retried', 'true'); // Mark that we are trying the redirect-recovery once
        handleSilentSSO(savedEmail);
      }
    }
  }, [handleSilentSSO]);

  const onLoginClick = () => {
    if (!emailInput) return setErrorMsg("Please enter an email.");
    localStorage.setItem('last_login_email', emailInput);
    localStorage.setItem('has_retried', 'false'); // Reset retry status on manual click
    handleSilentSSO(emailInput);
  };

  if (sfSession.isAuthenticated) {
    return (
      <div style={ { textAlign: 'center', marginTop: '50px' } }>
        <h1 style={ { color: 'green' } }>✅ Session Active</h1>
        <LightningContainer frontdoorUrl={ sfSession.frontdoorUrl } />
        <button onClick={ () => {
          setSfSession({ isAuthenticated: false });
          localStorage.removeItem('has_retried');
        } } style={ { marginTop: '20px' } }>Logout</button>
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
        style={ { padding: '10px', width: '250px', marginRight: '10px' } }
      />
      <button onClick={ onLoginClick } disabled={ loading } style={ { padding: '10px 20px' } }>
        { loading ? "Verifying..." : "Log In" }
      </button>
      { errorMsg && (
        <div style={ { color: 'red', marginTop: '20px', border: '1px solid red', padding: '10px' } }>
          <p><strong>ERROR:</strong> { errorMsg }</p>
          <p style={ { fontSize: '12px' } }>Check Setup > Session Settings > Trusted Domains for Inline Frames</p>
        </div>
      ) }
    </div>
  );
}

export default App;