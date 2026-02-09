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

  // Reusable login function
  const handleSilentSSO = useCallback(async (email) => {
    setLoading(true);
    setErrorMsg("");

    try {
      console.log(`Requesting SSO for: ${email}`);
      const response = await axios.post('/api/sso-login', {
        email: email
      });

      if (response.data.success) {
        console.group("SECURITY HANDSHAKE SUCCESS");
        console.log("FRONTDOOR URL:", response.data.frontdoorUrl);
        console.groupEnd();

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
      console.error("Connection Error:", err);
      setErrorMsg("Backend connection failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  // NEW: Handle the Auth0 Callback Code
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      console.log("Auth0 Callback Detected. Finishing Handshake...");

      // 1. Clear the code from the URL so it looks clean
      window.history.replaceState({}, document.title, window.location.pathname);

      // 2. Since we have a code, the user is authenticated in Auth0. 
      // In a real app, you'd exchange the code for a profile. 
      // Here, we trigger the SSO login to get the Salesforce session.
      // NOTE: You might need to store the email in localStorage to remember who to log in as.
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

  // --- RENDER ---
  if (sfSession.isAuthenticated) {
    return (
      <div style={ { textAlign: 'center', marginTop: '50px' } }>
        <h1>✅ SSO Validated</h1>
        <LightningContainer frontdoorUrl={ sfSession.frontdoorUrl } />
        <button onClick={ () => setSfSession({ isAuthenticated: false }) } style={ { marginTop: '20px' } }>
          Logout
        </button>
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
      <button
        onClick={ onLoginClick }
        disabled={ loading }
        style={ { padding: '10px 20px', cursor: 'pointer' } }
      >
        { loading ? "Verifying..." : "Log In" }
      </button>
      { errorMsg && <p style={ { color: 'red', marginTop: '10px' } }>{ errorMsg }</p> }
    </div>
  );
}

export default App;