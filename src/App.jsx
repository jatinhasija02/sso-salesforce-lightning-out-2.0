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
    instanceUrl: null,
    frontdoorUrl: null // Add this  
  });

  // src/App.jsx

  const handleSilentSSO = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      // --- STEP 1: FORCE LOGOUT PREVIOUS SESSION ---
      // This clears the browser cookies for salesforce.com
      const logoutImg = new Image();
      logoutImg.src = `https://algocirrus-b6-dev-ed.develop.my.salesforce.com/secur/logout.jsp?_=${Date.now()}`;

      // Wait a moment for the cookie clear to register
      await new Promise(resolve => setTimeout(resolve, 800));

      // --- STEP 2: PROCEED WITH NEW LOGIN ---
      console.log(`Requesting Fresh SSO for: ${emailInput}`);
      const response = await axios.post('/api/sso-login', {
        email: emailInput
      });

      if (response.data.success) {
        setSfSession({
          isAuthenticated: true,
          accessToken: response.data.accessToken,
          instanceUrl: response.data.instance_url,
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
  };

  // --- RENDER ---
  if (sfSession.isAuthenticated) {
    return (
      <div style={ { textAlign: 'center', marginTop: '50px' } }>
        <h1>✅ SSO Validated</h1>

        <LightningContainer
          frontdoorUrl={ sfSession.frontdoorUrl }
        />

        <button onClick={ () => setSfSession({ isAuthenticated: false }) }>
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
        onClick={ handleSilentSSO }
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