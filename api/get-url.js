import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  // 1. Manually handle CORS if needed
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { username } = req.query;
    if (!username) throw new Error("Username is required");

    // 2. Fix Private Key formatting (Vercel often breaks \n characters)
    const rawKey = process.env.SF_PRIVATE_KEY_CONTENT;
    if (!rawKey) throw new Error("SF_PRIVATE_KEY_CONTENT is missing in Vercel settings");
    const privateKey = rawKey.replace(/\\n/g, '\n');

    /* ================= 3. Generate JWT ================= */
    const jwtToken = jwt.sign(
      {
        iss: process.env.SF_CLIENT_ID,
        sub: username,
        aud: process.env.SF_LOGIN_URL,
        exp: Math.floor(Date.now() / 1000) + 300
      },
      privateKey,
      { algorithm: "RS256" }
    );

    /* ================= 4. Authenticate with Salesforce ================= */
    const sfRes = await fetch(`${process.env.SF_LOGIN_URL}/services/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwtToken
      })
    });

    const authData = await sfRes.json();
    if (!sfRes.ok) return res.status(401).json({ success: false, sf_error: authData });

    /* ================= 5. Get Lightning Out Session ================= */
    const loRes = await fetch(
      `${authData.instance_url}/services/oauth2/lightningoutsingleaccess`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authData.access_token}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          lightning_out_app_id: "1UsNS0000000CUD0A2" // Check this matches your SF App ID
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
    console.error("Backend Error:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}