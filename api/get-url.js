import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  console.log(">>> [BACKEND] Received request for username:", req.query.username);

  try {
    const { username } = req.query;
    if (!username) {
      console.error(">>> [ERROR] Username is missing in request");
      return res.status(400).json({ success: false, error: "Username is required" });
    }

    // Hardcoded for trials - Ensure NO LEADING SPACES in the key lines
    const SF_PRIVATE_KEY_CONTENT = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDAb9VpMLVyEvN3
l91x5ZzlwsY0tbUrR0+nNE+nMafTENNLVUgzqS3E97djJ6lWFxenwJlqhASgN6zc
Lim6bVRcagn3F5wJQdHdr+pcEmo7SKYI3WgIT8/2AfGzeIVxB5PS2TecE4qMfdfM
aGD9D3YO//pTv2A9dS6S8hLzvw8PXcLx8scFEV3b98jdjG+7cTik6mgpcA9QAdxr
Vozbw4suCBYNsxm4+9RzxNpb54x+RCpnjKt4mbsAbdipA5TO6rGHfEht2sVKHSdf
hmmQ3+9OnpmYDtqsDJdjc0nUWMEBK3n6k8hifj3lOSDQV3yL12W2k8wtrn/WmAmn
PVDYtOXzAgMBAAECggEATt0GDsfhdFCD6p0YKZc6B4cdB3j4ODZPVGzBv/k/l+Yr
UZIvtsw8b549T6tvYFKyZRMvTFGyO57Vfp6Eh1xK2Fy0nMjWL40D3uA7IWSCmK0b
LkLeYZmj1mPRlAVuWnYKhLx0Z8gyXYUtLR4RsWPmtBr/kda6MDWX0qzWS4IfP+Ir
7Ud1m6tGENouxGgb3WC1bDf2IJBbN6n5+u6V5REMllO3nXT8xuKWpglYGLrqBQha
KKBPPsjzdQxP543K7Xpbh9TOyMLGtYprY4Fcb5/AJ03/4+5/u5nCQ2wwAOcqOqmR
/j4tXuq8/M4tXiF7e18s2kJPWfrqTJX7EMlyUFgjAQKBgQD4jra3TyRKJQX70LAb
SL6nTNST4MqRFFYClfIjLyutz6UNAT73L37kYnkRFusZN1SMSlzO4fbuQmo2QT/p
KWnrkbHQoLcAcwZPNF1zfCj1iBGTZmlzwS8AnbXbMqUkPJTiIMbxR/AAJG4tmy6Q
c45s6YJUjVLw5uQK4WWsPGCDwQKBgQDGMu8rws3uI8sMkDKqJGFerywD+ZYv+na0
vzdgqR1eJY52QCqbGBZEh96NfIu46mFp6Nqct1i3wO7dj03pkh9eorqtgawwvClF
ChQC5qzf0gtm5v2mHG9PPGd7R3u6LyJvSTkanX/2ulabBKyJ1bqky3mTQ+rkXQcr
3nx44bJGswKBgQC8OW66gC8uCr1uRUmnT744+SCd34Pmu6yqhpx38ne0RuNpZsEk
9Q21q7CctWtRjCn1lzaS4GFbamX+MglQ6zCv2IP8RkhvCawEfNYr5yEpVmJg6hP/
OZL7d3LIzKBsQYhJeaLOArkHko7w8GwhrbB0X5x3pRHjJiYY6zlQZeR8wQKBgHaK
bivRNlNxCvd3oyXJ3oa/5GZ4N5B4j9jo6NkiLJNriPpGxHTAgkj4rm4XCIZPgHXU
tDO5IRG+Dd9r32CMacCzOU2e2frH/zLwpSlbCBhRy0n/a8OXDCfq68V66pBfsou2
0rWNb8SEjFnpALzrnNcFb7BZlbqBvVFKn025R2QrAoGAOyTQrNTX261/h+dbe+wf
uwyytLCbnrxGUNtfpk3mrdeZm92PWMvIjw8zD+G26vkGO5FILI6gCRf3OdTqpOqU
XIyhXRhekoj53krOTfBD1IR7cRRFrqFT8IekjKG/7Bw+1vU8ymqR2U6PUYpF8SbZ
0051VAlaS/uUCLg8Aspy6kk=
-----END PRIVATE KEY-----`;

    const SF_CLIENT_ID = '3MVG9VMBZCsTL9hnVO_6Q8ke.y8YH_PdvEaFgNFzWAELOYeUzsvkX3EwBJA31A1wP4MvYR.lFL4VsZpbWLd2H';
    const SF_LOGIN_URL = 'https://login.salesforce.com';

    console.log(">>> [BACKEND] Cleaning private key and signing JWT...");
    const privateKey = SF_PRIVATE_KEY_CONTENT.replace(/\\n/g, '\n');

    const jwtToken = jwt.sign(
      {
        iss: SF_CLIENT_ID,
        sub: username,
        aud: SF_LOGIN_URL,
        exp: Math.floor(Date.now() / 1000) + 300
      },
      privateKey,
      { algorithm: "RS256" }
    );

    console.log(">>> [BACKEND] Attempting Salesforce OAuth at:", `${SF_LOGIN_URL}/services/oauth2/token`);
    const sfRes = await fetch(`${SF_LOGIN_URL}/services/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwtToken
      })
    });

    const authData = await sfRes.json();

    if (!sfRes.ok) {
      // THIS LOG IS CRITICAL - Look for this in Vercel Logs
      console.error(">>> [SALESFORCE ERROR]", JSON.stringify(authData));
      return res.status(401).json({
        success: false,
        error: "Salesforce Auth Failed",
        salesforce_details: authData
      });
    }

    console.log(">>> [BACKEND] Salesforce Auth Success. Requesting Lightning Out Session...");
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
    console.log(">>> [BACKEND] Lightning Out Response received.");

    return res.status(200).json({
      success: true,
      url: loData.frontdoor_uri,
      instanceUrl: authData.instance_url
    });

  } catch (err) {
    console.error(">>> [CRITICAL ERROR]", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}