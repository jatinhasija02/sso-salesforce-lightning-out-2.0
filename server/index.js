const express = require('express');
const axios = require('axios');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const querystring = require('querystring');

const app = express();
app.use(cors());
app.use(express.json());

// --- 1. AUTH0 CONFIGURATION (Restored Your Keys) ---
const AUTH0_DOMAIN = "https://dev-sf4mdxnyt4bvy3np.us.auth0.com";
const AUTH0_CLIENT_ID = "SPlY0dELRN3uccQkHWAitNVM2v0UWJPv";
const AUTH0_CLIENT_SECRET = "9EDAWOhS9CrGLwOa8y_9HJSbkTJWqBgV-QksbVQfQD4bbvIRpxNEtL0I9FHemUzL";

// --- 2. SALESFORCE CONFIGURATION ---
const SF_LOGIN_URL = "https://login.salesforce.com";
const SF_CLIENT_ID = "3MVG9VMBZCsTL9hnVO_6Q8ke.y8YH_PdvEaFgNFzWAELOYeUzsvkX3EwBJA31A1wP4MvYR.lFL4VsZpbWLd2H";
// Ensure server.key exists in the same folder
const SF_PRIVATE_KEY = fs.readFileSync('serve.key', 'utf8');

// --- MAIN ENDPOINT ---
app.post('/api/sso-login', async (req, res) => {
    const { email } = req.body;
    const searchEmail = email.toLowerCase().trim();

    console.log(`\n🔵 Starting SSO Process for: ${searchEmail}`);

    try {
        // ==========================================
        // STEP 1: CHECK AUTH0 (Get Token -> Search User)
        // ==========================================
        console.log("   -> Step 1: Requesting Auth0 Management Token...");

        // 1. Get Manager Token
        const auth0TokenRes = await axios.post(`${AUTH0_DOMAIN}/oauth/token`, {
            client_id: AUTH0_CLIENT_ID,
            client_secret: AUTH0_CLIENT_SECRET,
            audience: `${AUTH0_DOMAIN}/api/v2/`,
            grant_type: 'client_credentials'
        });

        const auth0AccessToken = auth0TokenRes.data.access_token;
        console.log("   -> Auth0 Token Received. Searching for user...");

        // 2. Search for User
        const auth0UserRes = await axios.get(`${AUTH0_DOMAIN}/api/v2/users`, {
            params: { q: `email:"${searchEmail}"`, search_engine: 'v3' },
            headers: { Authorization: `Bearer ${auth0AccessToken}` }
        });

        if (auth0UserRes.data.length === 0) {
            console.warn("   ❌ User not found in Auth0.");
            return res.json({ success: false, message: "User not found in Auth0 database." });
        }
        console.log("   ✅ User Found in Auth0.");


        // ==========================================
        // STEP 2: SILENT LOGIN TO SALESFORCE (JWT)
        // ==========================================
        console.log("   -> Step 2: Attempting Salesforce Silent Login...");

        const jwtToken = jwt.sign(
            {
                iss: SF_CLIENT_ID,
                sub: searchEmail,
                aud: SF_LOGIN_URL,
                exp: Math.floor(Date.now() / 1000) + (3 * 60)
            },
            SF_PRIVATE_KEY,
            { algorithm: 'RS256' }
        );

        const sfTokenRes = await axios.post(
            `${SF_LOGIN_URL}/services/oauth2/token`,
            querystring.stringify({
                grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                assertion: jwtToken
            }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        console.log("   ✅ Salesforce Login Successful!");

        // ==========================================
        // STEP 3: RETURN SUCCESS
        // ==========================================
        res.json({
            success: true,
            accessToken: sfTokenRes.data.access_token,
            instanceUrl: sfTokenRes.data.instance_url
        });

    } catch (error) {
        // DETAILED ERROR LOGGING
        if (error.response) {
            console.error("❌ API Error:", error.response.data);
            if (error.response.data.error === 'access_denied') {
                console.error("   ⚠️ HINT: Check Auth0 M2M Permissions (Need 'read:users').");
            }
        } else {
            console.error("❌ System Error:", error.message);
        }

        res.status(500).json({ success: false, message: "SSO Process Failed." });
    }
});

app.listen(8080, () => console.log('🚀 Backend stable on http://localhost:8080'));