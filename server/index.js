const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors()); // Allows your React app to talk to this server
app.use(express.json());

// server/index.js

app.post('/api/check-user', async (req, res) => {
    const { email } = req.body;
    const searchEmail = email.toLowerCase().trim();

    try {
        // 1. GET TOKEN - Updated with your NEW M2M Credentials
        const tokenResponse = await axios.post(`https://dev-sf4mdxnyt4bvy3np.us.auth0.com/oauth/token`, {
            client_id: 'SPlY0dELRN3uccQkHWAitNVM2v0UWJPv', // From your new screenshot
            client_secret: '9EDAWOhS9CrGLwOa8y_9HJSbkTJWqBgV-QksbVQfQD4bbvIRpxNEtL0I9FHemUzL', // From your curl
            audience: `https://dev-sf4mdxnyt4bvy3np.us.auth0.com/api/v2/`,
            grant_type: 'client_credentials'
        });

        const accessToken = tokenResponse.data.access_token;

        // 2. SEARCH USER
        const userSearch = await axios.get(
            `https://dev-sf4mdxnyt4bvy3np.us.auth0.com/api/v2/users`,
            {
                params: { q: `email:"${searchEmail}"`, search_engine: 'v3' },
                headers: { Authorization: `Bearer ${accessToken}` }
            }
        );

        console.log(`Email searched: ${searchEmail} | Found: ${userSearch.data.length}`);
        console.log(`TOKEN: ${accessToken} `);
        res.json({ exists: userSearch.data.length > 0 });

    } catch (error) {
        console.error("Auth0 API Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Search failed" });
    }
});
app.listen(8080, () => console.log('🚀 Backend stable on http://localhost:8080'));