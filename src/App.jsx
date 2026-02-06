import React, { useState } from 'react';
import axios from 'axios';
import LightningContainer from './components/LightningContainer';

function App() {
  const [emailInput, setEmailInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [sfSession, setSfSession] = useState({
    isAuthenticated: false,
    accessToken: null,
    instanceUrl: null
  });

  const handleSilentSSO = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      console.log(`🔵 Requesting SSO for: ${emailInput}`);

      // FIXED: Call the relative path so it works on your Vercel domain
      const response = await axios.post('/api/sso-login', {
        email: emailInput
      });

      if (response.data.success) {
        console.group("🔐 SECURITY HANDSHAKE SUCCESS");
        console.log("1. Access Token Received");
        console.log("2. Instance URL:", response.data.instanceUrl);
        console.log("3. 🚀 FRONTDOOR URL (Magic Link):", response.data.frontdoorUrl);
        console.groupEnd();

        setSfSession({
          isAuthenticated: true,
          accessToken: response.data.accessToken,
          instanceUrl: response.data.instanceUrl
        });
      } else {
        setErrorMsg(response.data.message || "Login failed.");
      }
    } catch (err) {
      console.error("Connection Error:", err);
      setErrorMsg("Backend connection failed. Ensure environment variables are set in Vercel.");
    } finally {
      setLoading(false);
    }
  };

  if (sfSession.isAuthenticated) {
    return (
      <div style={ { textAlign: 'center', marginTop: '50px' } }>
        <h1>✅ SSO Validated</h1>
        <LightningContainer
          accessToken={ sfSession.accessToken }
          instanceUrl={ sfSession.instanceUrl }
        />
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
        style={ { padding: '10px', width: '250px' } }
      />
      <button onClick={ handleSilentSSO } disabled={ loading } style={ { marginLeft: '10px' } }>
        { loading ? "Verifying..." : "Log In" }
      </button>
      { errorMsg && <p style={ { color: 'red' } }>{ errorMsg }</p> }
    </div>
  );
}

export default App;