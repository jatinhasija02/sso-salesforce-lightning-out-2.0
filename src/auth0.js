import { createAuth0Client } from '@auth0/auth0-spa-js';

let auth0Client = null;

export async function initAuth0() {
    if (auth0Client) return auth0Client;

    auth0Client = await createAuth0Client({
        domain: 'dev-sf4mdxnyt4bvy3np.us.auth0.com',
        clientId: 'SNLKhYCyS6wgGZrVNfzNx7syQyhZLQSr',
        authorizationParams: {
            redirect_uri: window.location.origin,
        },
    });

    return auth0Client;
}

export async function auth0Login(username) {
    const client = await initAuth0();

    await client.loginWithRedirect({
        authorizationParams: {
            login_hint: username,   // IMPORTANT for your requirement
            prompt: 'login',
        },
    });
}

export function getAuth0Client() {
    if (!auth0Client) {
        throw new Error('Auth0 not initialized');
    }
    return auth0Client;
}
