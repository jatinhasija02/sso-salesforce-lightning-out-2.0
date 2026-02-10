import { useState } from "react";

const LightningOutApp = () => {
  const [email, setEmail] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");
  const [logStatus, setLogStatus] = useState("");

  const TARGET_USER = currentEmail || email;
  console.log('currentemail: ', currentEmail);
  console.log('email: ', email);

  const startLWC = async (userEmail) => {
    console.log("--- Starting LWC Process ---");
    setLogStatus("Step 1: Contacting Vercel API...");

    try {
      const response = await fetch(`/api/get-url?username=${encodeURIComponent(TARGET_USER)}`);
      console.log("API Fetch Status:", response.status);

      const result = await response.json();

      if (!result.success) {
        // Log the detailed Salesforce error to browser console
        console.error("Salesforce Auth Failure Details:", result.salesforce_details);
        const errorDesc = result.salesforce_details?.error_description || result.error;
        throw new Error(`SF Auth Failed: ${errorDesc}`);
      }

      setLogStatus("Step 2: Session active. Loading Salesforce script...");
      console.log("Instance URL for script:", result.instanceUrl);

      const script = document.createElement("script");
      script.src = `${result.instanceUrl}/lightning/lightning.out.latest/index.iife.prod.js`;
      script.async = true;

      script.onload = () => {
        console.log("Salesforce script loaded. Bootstrapping component...");
        setLogStatus("Step 3: Initializing LWC...");

        const loApp = document.querySelector("lightning-out-application");
        if (loApp) {
          loApp.setAttribute("frontdoor-url", result.url);
          setCurrentEmail(userEmail);
          setLogStatus("Success: LWC Loaded.");
          console.log("LWC process complete.");
        }
      };

      script.onerror = () => {
        console.error("Failed to load script from:", script.src);
        setLogStatus("Error: Salesforce script failed to load.");
      };

      document.body.appendChild(script);
    } catch (err) {
      console.error("Frontend Error:", err.message);
      setLogStatus("Error: " + err.message);
    }
  };

  return (
    <div style={ { padding: "20px" } }>
      <input
        type="email"
        placeholder="Enter email"
        value={ email }
        onChange={ (e) => setEmail(e.target.value) }
        style={ { padding: "8px", width: "400px", marginRight: "10px" } }
      />
      <button onClick={ () => email ? startLWC(email) : alert("Enter email") }>Launch LWC</button>

      <p style={ { color: "blue", fontWeight: "bold" } }>Status: { logStatus || "Idle" }</p>

      <lightning-out-application
        app-id="1UsNS0000000CUD0A2"
        components="c-hello-world-lwc"
        container-type="standard"
      ></lightning-out-application>

      <div style={ { marginTop: '20px', borderTop: '1px solid #ccc' } }>
        <c-hello-world-lwc email={ currentEmail }></c-hello-world-lwc>
      </div>
    </div>
  );
};

export default LightningOutApp;