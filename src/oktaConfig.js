// src/oktaConfig.js
export const oktaConfig = {
    clientId: 'n3aiMbhoqaQN9KfOvCvoOZ0BjxwppIhC', // Replace with your Client ID
    issuer: 'https://dev-sf4mdxnyt4bvy3np.us.auth0.com/authorize', // e.g., https://dev-1234.okta.com/oauth2/default
    redirectUri: window.location.origin + '/login/callback',
    scopes: ['openid', 'profile', 'email'],
    pkce: true
};