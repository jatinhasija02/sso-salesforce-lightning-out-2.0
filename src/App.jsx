// src/App.jsx
import { useEffect, useState } from 'react';
import { AUTH_STATE } from './authStates';
import {
  performSilentLogin, // Use the new silent function
  isAuth0Authenticated,
  auth0Logout,
  handleAuth0Redirect
} from './auth0';
import { loginToSalesforce } from './salesforceSSO';
import { loadLightningOut } from './lightning/lightning';
import { verifySalesforceSession } from './auth/salesforceSession';
import LoginScreen from './LoginScreen';

function App() {
  const [authState, setAuthState] = useState(AUTH_STATE.INIT);
  const [securityError, setSecurityError] = useState('');

  // The logic to run once identity is strictly confirmed
  const proceedToSalesforce = async () => {
    try {
      setAuthState(AUTH_STATE.AUTH0_OK);

      // Step 2: Salesforce Silent Login (via SSO integration)
      await loginToSalesforce();
      setAuthState(AUTH_STATE.SF_OK);

      // Step 3 & 4: Verify session and render LWC
      await verifySalesforceSession();
      await loadLightningOut();
      setAuthState(AUTH_STATE.LIGHTNING_READY);
    } catch (e) {
      console.error('Salesforce Flow Error:', e);
      setSecurityError('Salesforce session could not be established.');
      setAuthState(AUTH_STATE.ERROR);
    }
  };

  const handleLogin = async (inputUsername) => {
    setSecurityError(''); // Clear errors on same screen
    try {
      // 1. Perform Silent Auth (Direct Login)
      // This will NOT redirect the page. It stays here and returns or throws.
      await performSilentLogin(inputUsername);

      // 2. If it reaches here, the user matches SSO! Change screen now.
      await proceedToSalesforce();

    } catch (e) {
      // ERROR ON SAME SCREEN: We stay in AUTH_STATE.INIT
      console.error('Access Denied:', e.message);
      setSecurityError(e.message);
    }
  };

  useEffect(() => {
    const autoInit = async () => {
      // Check if we already have an active session in local memory
      await handleAuth0Redirect();
      const isAuth = await isAuth0Authenticated();
      if (isAuth) {
        await proceedToSalesforce();
      }
    };
    autoInit();
  }, []);

  return (
    <>
      { authState !== AUTH_STATE.INIT && (
        <button onClick={ () => auth0Logout() } style={ { float: 'right', margin: '10px' } }>Logout</button>
      ) }

      {/* Renders LoginScreen with Error Message on same screen if validation fails */ }
      { authState === AUTH_STATE.INIT && (
        <div style={ { textAlign: 'center' } }>
          <LoginScreen onLogin={ handleLogin } />
          { securityError && (
            <div style={ {
              color: '#d32f2f',
              fontWeight: 'bold',
              marginTop: '20px',
              padding: '10px',
              border: '1px solid red',
              display: 'inline-block'
            } }>
              { securityError }
            </div>
          ) }
        </div>
      ) }

      { (authState === AUTH_STATE.AUTH0_OK || authState === AUTH_STATE.SF_OK) && (
        <div style={ { marginTop: '50px', textAlign: 'center' } }>
          <h2>Identity Verified</h2>
          <p>Connecting to Salesforce via SSO...</p>
        </div>
      ) }

      { authState === AUTH_STATE.LIGHTNING_READY && (
        <div id="lightning-container" style={ { marginTop: '20px' } }></div>
      ) }

      { authState === AUTH_STATE.ERROR && (
        <div style={ { textAlign: 'center', marginTop: '50px' } }>
          <h2 style={ { color: 'red' } }>Login Blocked</h2>
          <p>{ securityError }</p>
          <button onClick={ () => window.location.reload() }>Try Again</button>
        </div>
      ) }
    </>
  );
}

export default App;