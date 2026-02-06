import React, { useState } from 'react';
import axios from 'axios';
import LightningContainer from './components/LightningContainer';

function App() {
  const [emailInput, setEmailInput] = useState("hasijajassi02@gmail.com");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // State for Salesforce Session
  const [sfSession, setSfSession] = useState({
    isAuthenticated: false,
    accessToken: null,
    instanceUrl: null
  });

  const handleSilentSSO = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      console.log(`🔵 Initiating SSO for: ${emailInput}`);

      // Call our Unified Backend Endpoint
      const response = await axios.post('http://localhost:8080/api/sso-login', {
        email: emailInput
      });

      console.log("Backend Response:", response.data);

      if (response.data.success) {
        // Success! We have the token.
        setSfSession({
          isAuthenticated: true,
          accessToken: response.data.accessToken,
          instanceUrl: response.data.instanceUrl
        });
      } else {
        // Failed Logic (User not found in Auth0 OR Salesforce)
        setErrorMsg(response.data.message || "Login failed.");
      }
    } catch (err) {
      console.error("System Error:", err);
      setErrorMsg("Connection Error. Is the backend server running?");
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER ---

  // SCENARIO 1: LOGGED IN -> SHOW SALESFORCE COMPONENT
  if (sfSession.isAuthenticated) {
    return (
      <div style={ { textAlign: 'center', marginTop: '50px' } }>
        <h1>✅ SSO Complete</h1>
        <p>User validated in Auth0 & Salesforce.</p>

        {/* Helper Component to Render LWC */ }
        <LightningContainer
          accessToken={ sfSession.accessToken }
          instanceUrl={ sfSession.instanceUrl }
        />

        <br />
        <button
          onClick={ () => setSfSession({ isAuthenticated: false, accessToken: null }) }
          style={ { padding: '10px 20px', cursor: 'pointer', marginTop: '20px' } }
        >
          Logout
        </button>
      </div>
    );
  }

  // SCENARIO 2: LOGIN SCREEN
  return (
    <div style={ { textAlign: 'center', marginTop: '50px' } }>
      <h2>Unified SSO Login</h2>
      <p>Checks Auth0 + Salesforce silently.</p>

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
        { loading ? "Verifying..." : "Enter App" }
      </button>

      { errorMsg && <p style={ { color: 'red', marginTop: '15px', fontWeight: 'bold' } }>{ errorMsg }</p> }
    </div>
  );
}

export default App;