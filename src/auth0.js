// src/auth0.js
import { createAuth0Client } from '@auth0/auth0-spa-js';

let auth0Client = null;

export async function initAuth0() {
    if (auth0Client) return auth0Client;
    auth0Client = await createAuth0Client({
        domain: 'dev-sf4mdxnyt4bvy3np.us.auth0.com',
        clientId: 'SNLKhYCyS6wgGZrVNfzNx7syQyhZLQSr',
        cacheLocation: 'localstorage',
        authorizationParams: {
            redirect_uri: window.location.origin,
        },
    });
    return auth0Client;
}

/**
 * NEW: Performs a silent SSO check. 
 * If user is not logged into SSO or username mismatches, it throws an error.
 */
export async function performSilentLogin(username) {
    const client = await initAuth0();

    try {
        // 1. Ask Auth0 for a token silently (checks SSO cookies in background)
        // If the user has no session at dev-sf4mdxnyt4bvy3np.us.auth0.com, this fails.
        await client.getTokenSilently({
            authorizationParams: { login_hint: username }
        });

        // 2. Get the actual user profile from the SSO session
        const user = await client.getUser();

        // 3. STRICT IDENTITY CHECK
        if (!user || !user.email || user.email.toLowerCase() !== username.toLowerCase()) {
            throw new Error(`Identity Mismatch: SSO is logged in as ${user?.email || 'unknown'}, not ${username}.`);
        }

        return user; // Success - user matches SSO session
    } catch (error) {
        // Handle specific Auth0 error for "not logged in"
        if (error.error === 'login_required') {
            throw new Error(`Direct Login Failed: No active SSO session found for ${username}.`);
        }
        throw error;
    }
}

// Keep existing helpers for Logout and Redirect (if needed for edge cases)
export async function handleAuth0Redirect() {
    const client = await initAuth0();
    const query = window.location.search;
    if (query.includes("code=") && query.includes("state=")) {
        await client.handleRedirectCallback();
        window.history.replaceState({}, document.title, "/");
        return true;
    }
    return false;
}

export async function isAuth0Authenticated() {
    const client = await initAuth0();
    return await client.isAuthenticated();
}

export async function getAuth0User() {
    const client = await initAuth0();
    return await client.getUser();
}

export async function auth0Logout() {
    const client = await initAuth0();
    await client.logout({ logoutParams: { returnTo: window.location.origin } });
}