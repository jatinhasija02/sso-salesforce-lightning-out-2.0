// App.jsx
import { useEffect, useState } from 'react';
import { AUTH_STATE } from './authStates';
import { auth0Login } from './auth0';
import { loginToSalesforce } from './salesforceSSO';
import { loadLightningOut } from './lightning/lightning';
import { verifySalesforceSession } from './auth/salesforceSession';
import { LoginScreen } from './LoginScreen';
import { handleLogout } from './auth/logout';

function App() {
  const [authState, setAuthState] = useState(AUTH_STATE.INIT);
  const [username, setUsername] = useState(null);

  const handleLogin = async (inputUsername) => {
    try {
      setUsername(inputUsername);

      // 1️⃣ Auth0
      await auth0Login(inputUsername);
      setAuthState(AUTH_STATE.AUTH0_OK);

      // 2️⃣ Salesforce SSO
      await loginToSalesforce();
      setAuthState(AUTH_STATE.SF_OK);

      await verifySalesforceSession();
      
      // 3️⃣ Lightning Out
      await loadLightningOut();
      setAuthState(AUTH_STATE.LIGHTNING_READY);

    } catch (e) {
      console.error(e);
      setAuthState(AUTH_STATE.ERROR);
    }
  };
  useEffect(() => {
  let intervalId;

  if (authState === AUTH_STATE.LIGHTNING_READY) {
    intervalId = setInterval(async () => {
      try {
        await verifySalesforceSession();
      } catch {
        window.location.reload(); // forces re-auth
      }
    }, 5 * 60 * 1000);
  }
  return () => {
    if (intervalId) clearInterval(intervalId);
  };
}, [authState]);

  return (
    <>
      <button onClick={handleLogout}>Logout</button>

      {authState === AUTH_STATE.INIT && (
        <LoginScreen onSubmit={handleLogin} />
      )}

      {authState === AUTH_STATE.LIGHTNING_READY && (
        <div id="lightning-container"></div>
      )}

      {authState === AUTH_STATE.ERROR && (
        <div>Authentication failed</div>
      )}
    </>
  );
}

export default App;
