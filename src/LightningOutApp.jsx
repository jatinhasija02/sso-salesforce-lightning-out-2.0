import { useState } from "react";

const LightningOutApp = () => {
  const TARGET_USER = "hasijajassi02@gmail.com";
  const [email, setEmail] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");
  const [logStatus, setLogStatus] = useState("");

  const startLWC = async (userEmail) => {
    setLogStatus("Requesting secure session...");

    try {
      // Ensure this matches your filename in /api/
      const response = await fetch(`/api/get-url?username=${encodeURIComponent(TARGET_USER)}`);
      const result = await response.json();

      if (!result.success) throw new Error(result.error || "Auth Failed");

      setLogStatus("Session active. Loading Salesforce Lightning Out...");

      const script = document.createElement("script");
      // Use the instance URL returned from the API for the script source
      script.src = `${result.instanceUrl}/lightning/lightning.out.latest/index.iife.prod.js`;
      script.async = true;

      script.onload = () => {
        const loApp = document.querySelector("lightning-out-application");
        if (loApp) {
          loApp.setAttribute("frontdoor-url", result.url);
          setCurrentEmail(userEmail);
          setLogStatus("LWC Ready.");
        }
      };

      document.body.appendChild(script);
    } catch (err) {
      setLogStatus("Error: " + err.message);
    }
  };

  return (
    <div style={ { padding: "20px" } }>
      <input
        type="email"
        value={ email }
        onChange={ (e) => setEmail(e.target.value) }
        placeholder="Enter email for LWC"
        style={ { padding: "8px", width: "300px" } }
      />
      <button onClick={ () => email ? startLWC(email) : alert("Enter email") }>
        Load Component
      </button>

      { logStatus && <p style={ { color: "gray" } }>{ logStatus }</p> }

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