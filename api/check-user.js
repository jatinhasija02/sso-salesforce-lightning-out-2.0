const axios = require('axios');

export default async function handler(req, res) {
    const { email } = req.body;

    try {
        // 1. Get Access Token
        const tokenResponse = await axios.post(`https://dev-sf4mdxnyt4bvy3np.us.auth0.com/oauth/token`, {
            client_id: 'n3aiMbhoqaQN9KfOvCvoOZ0BjxwppIhC',
            client_secret: 'cD2NgGJOpw-QiAkIl27bJRpOlsLcWl_nYEP0ctj6nuqjfkwuRrQ9mFMF75tgzasP',
            audience: `https://dev-sf4mdxnyt4bvy3np.us.auth0.com/api/v2/`,
            grant_type: 'client_credentials'
        });

        const accessToken = tokenResponse.data.access_token;

        // 2. Search Auth0 for the user
        // We search by email to see if they exist in your database
        const userSearch = await axios.get(
            `https://dev-sf4mdxnyt4bvy3np.us.auth0.com/api/v2/users-by-email?email=${email}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );

        // 3. Return Result
        if (userSearch.data.length > 0) {
            return res.status(200).json({ exists: true });
        } else {
            return res.status(200).json({ exists: false });
        }

    } catch (error) {
        console.error("Auth0 Check Failed:", error.response?.data || error.message);
        return res.status(500).json({ error: "Server Error" });
    }
}