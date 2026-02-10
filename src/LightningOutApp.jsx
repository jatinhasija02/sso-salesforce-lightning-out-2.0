import { useState } from "react";

const LightningOutApp = () => {
  const TARGET_USER = "hasijajassi02@gmail.com";
  const [email, setEmail] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");
  const [logStatus, setLogStatus] = useState("");

  const startLWC = async (userEmail) => {
    console.log("Button clicked. Starting LWC process for:", userEmail);
    setLogStatus(`Step 1: Authenticating for ${TARGET_USER}...`);

    try {
      const response = await fetch(`/api/get-url?username=${encodeURIComponent(TARGET_USER)}`);

      console.log("API Response Status:", response.status);
      const result = await response.json();

      if (!result.success) {
        console.error("Backend reported failure:", result);
        throw new Error(result.error || "Auth Failed");
      }

      console.log("Backend Success! Secure URL obtained.");
      setLogStatus("Step 2: Session active. Loading script...");

      const script = document.createElement("script");
      script.src = `${result.instanceUrl}/lightning/lightning.out.latest/index.iife.prod.js`;
      script.async = true;

      script.onload = () => {
        console.log("Salesforce script loaded. Initializing application...");
        setLogStatus("Step 3: Script ready. Bootstrapping LWC...");

        const loApp = document.querySelector("lightning-out-application");
        if (loApp) {
          loApp.setAttribute("frontdoor-url", result.url);
          setCurrentEmail(userEmail);
          setLogStatus("LWC Loaded successfully.");
          console.log("LWC process complete.");
        } else {
          console.error("Could not find <lightning-out-application> in DOM");
        }
      };

      script.onerror = (e) => {
        console.error("Failed to load the Salesforce script from:", script.src);
        setLogStatus("Error: Failed to load Salesforce script.");
      };

      document.body.appendChild(script);
    } catch (err) {
      console.error("Frontend process error:", err);
      setLogStatus("Error: " + err.message);
    }
  };

  return (
    <div style={ { padding: "20px" } }>
      <div style={ { marginBottom: "16px" } }>
        <input
          type="email"
          placeholder="Enter email"
          value={ email }
          onChange={ (e) => setEmail(e.target.value) }
          style={ { padding: "8px", width: "400px", marginRight: "10px" } }
        />
        <button onClick={ () => email ? startLWC(email) : alert("Enter email") }>
          Launch LWC
        </button>
      </div>

      <p style={ { color: "blue", fontWeight: "bold" } }>Status: { logStatus || "Waiting for user..." }</p>

      <lightning-out-application
        app-id="1UsNS0000000CUD0A2"
        components="c-hello-world-lwc"
      ></lightning-out-application>

      <div style={ { marginTop: '20px', borderTop: '1px solid #ccc' } }>
        <c-hello-world-lwc email={ currentEmail }></c-hello-world-lwc>
      </div>
    </div>
  );
};

export default LightningOutApp;