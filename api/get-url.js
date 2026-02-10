import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  // 1. Set headers for cross-origin if necessary
  res.setHeader("Content-Type", "application/json");

  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({ success: false, error: "Username is required" });
    }

    // 2. Validate and Clean Private Key
    // Vercel sometimes mangles newlines in keys; this regex fixes them.
    const rawKey = process.env.SF_PRIVATE_KEY_CONTENT;
    if (!rawKey) throw new Error("SF_PRIVATE_KEY_CONTENT is not defined in Vercel settings");
    const privateKey = rawKey.replace(/\\n/g, '\n');

    /* ================= 3. Create JWT ================= */
    const jwtToken = jwt.sign(
      {
        iss: process.env.SF_CLIENT_ID,
        sub: username,
        aud: process.env.SF_LOGIN_URL, // e.g., https://login.salesforce.com
        exp: Math.floor(Date.now() / 1000) + 300
      },
      privateKey,
      { algorithm: "RS256" }
    );

    /* ================= 4. Get Salesforce Access Token ================= */
    const sfRes = await fetch(`${process.env.SF_LOGIN_URL}/services/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwtToken
      })
    });

    const authData = await sfRes.json();
    if (!sfRes.ok) {
      return res.status(401).json({ success: false, salesforce_error: authData });
    }

    /* ================= 5. Get Lightning Out Frontdoor URL ================= */
    const loRes = await fetch(
      `${authData.instance_url}/services/oauth2/lightningoutsingleaccess`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authData.access_token}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          lightning_out_app_id: "1UsNS0000000CUD0A2" // Your LoApp ID
        })
      }
    );

    const loData = await loRes.json();

    return res.status(200).json({
      success: true,
      url: loData.frontdoor_uri,
      instanceUrl: authData.instance_url
    });

  } catch (err) {
    console.error("SERVER ERROR:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}