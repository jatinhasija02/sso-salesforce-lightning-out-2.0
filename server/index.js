require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

const app = express();
app.use(cors());
app.use(express.json());

// --- SECURE CONFIGURATION ---
const {
    AUTH0_DOMAIN,
    AUTH0_M2M_CLIENT_ID,
    AUTH0_M2M_CLIENT_SECRET,
    SF_LOGIN_URL,
    SF_CLIENT_ID,
    SF_PRIVATE_KEY_CONTENT
} = process.env;

// This handles both local file reading and Vercel environment variables
let SF_PRIVATE_KEY;
if (SF_PRIVATE_KEY_CONTENT) {
    // If on Vercel, replace escaped newlines
    SF_PRIVATE_KEY = SF_PRIVATE_KEY_CONTENT.replace(/\\n/g, '\n');
} else {
    // If local, read from the file
    try {
        SF_PRIVATE_KEY = fs.readFileSync(path.join(__dirname, 'server.key'), 'utf8');
    } catch (e) {
        console.error("server.key not found. Ensure it exists in the server folder locally.");
    }
}

app.post('/api/sso-login', async (req, res) => {
    const { email } = req.body;
    const searchEmail = email.toLowerCase().trim();

    try {
        // 1. Auth0 Check
        const auth0TokenRes = await axios.post(`${AUTH0_DOMAIN}/oauth/token`, {
            client_id: AUTH0_M2M_CLIENT_ID,
            client_secret: AUTH0_M2M_CLIENT_SECRET,
            audience: `${AUTH0_DOMAIN}/api/v2/`,
            grant_type: 'client_credentials'
        });

        const auth0UserRes = await axios.get(`${AUTH0_DOMAIN}/api/v2/users-by-email`, {
            params: { email: searchEmail },
            headers: { Authorization: `Bearer ${auth0TokenRes.data.access_token}` }
        });

        if (auth0UserRes.data.length === 0) {
            return res.json({ success: false, message: "User not found in Auth0." });
        }

        // 2. Salesforce JWT Sign
        const jwtToken = jwt.sign(
            { iss: SF_CLIENT_ID, sub: searchEmail, aud: SF_LOGIN_URL, exp: Math.floor(Date.now() / 1000) + 180 },
            SF_PRIVATE_KEY,
            { algorithm: 'RS256' }
        );

        // 3. Exchange for Salesforce Token
        const sfTokenRes = await axios.post(`${SF_LOGIN_URL}/services/oauth2/token`,
            querystring.stringify({
                grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                assertion: jwtToken
            }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        const accessToken = sfTokenRes.data.access_token;
        const instanceUrl = sfTokenRes.data.instance_url;
        const frontdoorUrl = `${instanceUrl}/secur/frontdoor.jsp?sid=${accessToken}`;

        res.json({ success: true, accessToken, instanceUrl, frontdoorUrl });

    } catch (error) {
        console.error("SSO Error:", error.response?.data || error.message);
        res.status(500).json({ success: false, message: "Handshake failed." });
    }
});

// For local running
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => console.log(`Local Server: http://localhost:${PORT}`));
}

// Export for Vercel
module.exports = app;