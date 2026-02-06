import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [emailInput, setEmailInput] = useState("");
  const [isLocallyAuthenticated, setIsLocallyAuthenticated] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheckAndBypass = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      // 1. Ask your backend if the user exists in Auth0
      const response = await axios.post('http://localhost:8080/api/check-user', { 
        email: emailInput 
      });
      console.log(`Email searched: ${emailInput} | Found: ${response.data.exists}`);
      console.log(`${response.config}`);
      console.log(`==> , ${response.headers}`);
      console.log(`==> , ${JSON.stringify(response)}`);
      
      if (response.data.exists) {
        setIsLocallyAuthenticated(true);
      }
      // if (response.data.exists) {
      //   console.log("✅ User verified. Initiating Salesforce background login...");
      //   const auth0SforceUrl = `https://dev-sf4mdxnyt4bvy3np.us.auth0.com/authorize` + 
      //                         `?client_id=n3aiMbhoqaQN9KfOvCvoOZ0BjxwppIhC` + 
      //                         `&response_type=code` + 
      //                         `&connection=Username-Password-Authentication` + 
      //                         `&login_hint=${emailInput}` + 
      //                         `&redirect_uri=https://algocirrus-b6-dev-ed.develop.my.salesforce.com`;

      //   window.location.href = auth0SforceUrl;
      // }
       else {
        setErrorMsg("Access Denied: You are not a registered user.");
      }
    } catch (err) {
      setErrorMsg("System Error: Could not verify user.");
    } finally {
      setLoading(false);
    }
  };

  // IF LOGGED IN LOCALLY, SHOW THE APP CONTENT
  if (isLocallyAuthenticated) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h1>✅ Access Granted</h1>
        <p>Welcome back, {emailInput}!</p>
        <button onClick={() => setIsLocallyAuthenticated(false)}>Logout</button>
      </div>
    );
  }

  // IF NOT LOGGED IN, SHOW THE EMAIL CHECK SCREEN
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>Enter Email to Enter App</h2>
      <input 
        type="email" 
        value={emailInput}
        onChange={(e) => setEmailInput(e.target.value)}
        placeholder="user@example.com"
        style={{ padding: '10px', width: '250px' }}
      />
      <button onClick={handleCheckAndBypass} disabled={loading}>
        {loading ? "Checking..." : "Enter"}
      </button>
      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
    </div>
  );
}

export default App;