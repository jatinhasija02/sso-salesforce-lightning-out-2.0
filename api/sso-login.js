const axios = require('axios');
const jwt = require('jsonwebtoken');
const querystring = require('querystring');

module.exports = async (req, res) => {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required." });
    }

    const searchEmail = email.toLowerCase().trim();

    const {
        AUTH0_DOMAIN,
        AUTH0_M2M_CLIENT_ID,
        AUTH0_M2M_CLIENT_SECRET,
        SF_LOGIN_URL,
        SF_CLIENT_ID,
        SF_PRIVATE_KEY_CONTENT
    } = process.env;

    // VALIDATION: Ensure the key exists in environment variables
    if (!SF_PRIVATE_KEY_CONTENT) {
        console.error("CRITICAL: SF_PRIVATE_KEY_CONTENT is missing.");
        return res.status(500).json({ success: false, message: "Server configuration error: Missing Private Key." });
    }

    // FIX: Convert literal "\n" strings into actual line breaks for the RSA parser
    const SF_PRIVATE_KEY = SF_PRIVATE_KEY_CONTENT.replace(/\\n/g, '\n');

    try {
        // 1. Auth0 Search
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
            return res.status(404).json({ success: false, message: "User not found in Auth0 database." });
        }

        // 2. Salesforce JWT Signing - Using RS256 algorithm
        const jwtToken = jwt.sign(
            {
                iss: SF_CLIENT_ID,
                sub: searchEmail,
                aud: SF_LOGIN_URL,
                exp: Math.floor(Date.now() / 1000) + 180
            },
            SF_PRIVATE_KEY, // The multi-line RSA key
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

        const accessToken = sfTokenRes.data.access_token;
        const instanceUrl = sfTokenRes.data.instance_url;

        return res.status(200).json({
            success: true,
            accessToken,
            instanceUrl,
            frontdoorUrl: `${instanceUrl}/secur/frontdoor.jsp?sid=${accessToken}`
        });

    } catch (error) {
        console.error("SSO Error:", error.response?.data || error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error during handshake.",
            details: error.response?.data || error.message
        });
    }
};