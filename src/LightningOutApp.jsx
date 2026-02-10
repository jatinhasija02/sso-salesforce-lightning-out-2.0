import { useState } from "react";

const LightningOutApp = () => {
  const TARGET_USER = "hasijajassi02@gmail.com"; // Your Salesforce username
  const [email, setEmail] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");
  const [logStatus, setLogStatus] = useState("");

  const startLWC = async (userEmail) => {
    setLogStatus(`Authenticating for ${TARGET_USER}...`);

    try {
      const response = await fetch(`/api/get-url?username=${encodeURIComponent(TARGET_USER)}`);
      const result = await response.json();

      if (!result.success) throw new Error(result.error || "Auth Failed");

      setLogStatus("Session active. Loading Salesforce components...");

      // 🔹 Load the script from the instance URL returned by your backend
      const script = document.createElement("script");
      script.src = `${result.instanceUrl}/lightning/lightning.out.latest/index.iife.prod.js`;
      script.async = true;

      script.onload = () => {
        const loApp = document.querySelector("lightning-out-application");
        if (loApp) {
          loApp.setAttribute("frontdoor-url", result.url);
          setCurrentEmail(userEmail); // Update the LWC prop
          setLogStatus("LWC Loaded.");
        }
      };

      document.body.appendChild(script);
    } catch (err) {
      setLogStatus("Error: " + err.message);
    }
  };

  return (
    <div style={ { padding: "20px" } }>
      <div style={ { marginBottom: "16px" } }>
        <input
          type="email"
          placeholder="Enter email to pass to LWC"
          value={ email }
          onChange={ (e) => setEmail(e.target.value) }
          style={ { padding: "8px", width: "400px", marginRight: "10px" } }
        />
        <button onClick={ () => email ? startLWC(email) : alert("Enter an email") }>
          Launch LWC
        </button>
      </div>

      { logStatus && <p style={ { color: "blue" } }>{ logStatus }</p> }

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