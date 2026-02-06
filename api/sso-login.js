const axios = require('axios');
const jwt = require('jsonwebtoken');
const querystring = require('querystring');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { email } = req.body;
    const {
        AUTH0_DOMAIN,
        AUTH0_M2M_CLIENT_ID,
        AUTH0_M2M_CLIENT_SECRET,
        SF_LOGIN_URL,
        SF_CLIENT_ID,
        SF_PRIVATE_KEY_CONTENT
    } = process.env;

    if (!SF_PRIVATE_KEY_CONTENT) {
        return res.status(500).json({ success: false, message: "Server configuration error: Private Key missing." });
    }

    // --- NEW RSA KEY CLEANER ---
    // This removes extra quotes, converts literal \n to real newlines, 
    // and ensures the BEGIN/END headers exist on their own lines.
    const cleanKey = (key) => {
        return key
            .replace(/^"|"$/g, '')             // Remove surrounding quotes if they exist
            .replace(/\\n/g, '\n')              // Convert literal \n to real newlines
            .replace(/-----BEGIN PRIVATE KEY-----/, '-----BEGIN PRIVATE KEY-----\n')
            .replace(/-----END PRIVATE KEY-----/, '\n-----END PRIVATE KEY-----')
            .replace(/\n+/g, '\n');             // Remove accidental double newlines
    };

    const SF_PRIVATE_KEY = cleanKey(SF_PRIVATE_KEY_CONTENT);

    try {
        // 1. Auth0 Search
        const auth0TokenRes = await axios.post(`${AUTH0_DOMAIN}/oauth/token`, {
            client_id: AUTH0_M2M_CLIENT_ID,
            client_secret: AUTH0_M2M_CLIENT_SECRET,
            audience: `${AUTH0_DOMAIN}/api/v2/`,
            grant_type: 'client_credentials'
        });

        const auth0UserRes = await axios.get(`${AUTH0_DOMAIN}/api/v2/users-by-email`, {
            params: { email: email.toLowerCase().trim() },
            headers: { Authorization: `Bearer ${auth0TokenRes.data.access_token}` }
        });

        if (auth0UserRes.data.length === 0) {
            return res.status(404).json({ success: false, message: "User not found in Auth0." });
        }

        // 2. Salesforce JWT Signing
        const jwtToken = jwt.sign(
            {
                iss: SF_CLIENT_ID,
                sub: email.toLowerCase().trim(),
                aud: SF_LOGIN_URL,
                exp: Math.floor(Date.now() / 1000) + 180
            },
            SF_PRIVATE_KEY,
            { algorithm: 'RS256' }
        );

        // 3. Salesforce Token Exchange
        const sfTokenRes = await axios.post(`${SF_LOGIN_URL}/services/oauth2/token`,
            querystring.stringify({
                grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                assertion: jwtToken
            }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        return res.status(200).json({
            success: true,
            accessToken: sfTokenRes.data.access_token,
            instanceUrl: sfTokenRes.data.instance_url,
            frontdoorUrl: `${sfTokenRes.data.instance_url}/secur/frontdoor.jsp?sid=${sfTokenRes.data.access_token}`
        });

    } catch (error) {
        console.error("SSO Error Detail:", error.response?.data || error.message);
        return res.status(500).json({
            success: false,
            message: "Handshake failed.",
            error: error.response?.data || error.message
        });
    }
};