import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({ success: false, error: "Username is required" });
    }

    // 1. Use process.env and fix Private Key newlines
    const privateKey = process.env.SF_PRIVATE_KEY_CONTENT.replace(/\\n/g, '\n');

    /* ================= 2. Create JWT with process.env ================= */
    const jwtToken = jwt.sign(
      {
        iss: process.env.SF_CLIENT_ID,     // Changed from import.meta.env
        sub: username,
        aud: process.env.SF_LOGIN_URL,    // Changed from import.meta.env
        exp: Math.floor(Date.now() / 1000) + 300
      },
      privateKey,
      { algorithm: "RS256" }
    );

    /* ================= 3. Get Salesforce Access Token ================= */
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
      return res.status(401).json({
        success: false,
        salesforce_status: sfRes.status,
        salesforce_response: authData
      });
    }

    /* ================= 4. Get Lightning Out Frontdoor URL ================= */
    const loRes = await fetch(
      `${authData.instance_url}/services/oauth2/lightningoutsingleaccess`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authData.access_token}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          lightning_out_app_id: "1UsNS0000000CUD0A2"
        })
      }
    );

    const loData = await loRes.json();

    if (!loData.frontdoor_uri) {
      return res.status(500).json({
        success: false,
        error: "Lightning Out frontdoor URL not returned",
        details: loData
      });
    }

    return res.status(200).json({ success: true, url: loData.frontdoor_uri });

  } catch (err) {
    console.error("GET-URL CRASH:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}