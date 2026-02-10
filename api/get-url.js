import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  // Set response headers for JSON and CORS
  res.setHeader("Content-Type", "application/json");

  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({ success: false, error: "Username is required" });
    }

    // 1. Fix Private Key: Vercel environment variables often mangle newlines.
    const rawKey = process.env.SF_PRIVATE_KEY_CONTENT;
    if (!rawKey) throw new Error("SF_PRIVATE_KEY_CONTENT is missing in Vercel settings");
    const privateKey = rawKey.replace(/\\n/g, '\n');

    /* ================= 2. Create JWT Assertion ================= */
    const jwtToken = jwt.sign(
      {
        iss: process.env.SF_CLIENT_ID,     // Consumer Key from Connected App
        sub: username,                    // Salesforce Username
        aud: process.env.SF_LOGIN_URL,    // https://login.salesforce.com or test.salesforce.com
        exp: Math.floor(Date.now() / 1000) + 300
      },
      privateKey,
      { algorithm: "RS256" }
    );

    /* ================= 3. Get Access Token ================= */
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

    /* ================= 4. Get Lightning Out Session ================= */
    const loRes = await fetch(
      `${authData.instance_url}/services/oauth2/lightningoutsingleaccess`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authData.access_token}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          lightning_out_app_id: "1UsNS0000000CUD0A2" // Your 18-digit LoApp ID
        })
      }
    );

    const loData = await loRes.json();

    if (!loData.frontdoor_uri) {
      return res.status(500).json({ success: false, error: "Frontdoor URL not returned", details: loData });
    }

    // Return the frontdoor URL and the instance URL for script loading
    return res.status(200).json({
      success: true,
      url: loData.frontdoor_uri,
      instanceUrl: authData.instance_url
    });

  } catch (err) {
    console.error("GET-URL ERROR:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}