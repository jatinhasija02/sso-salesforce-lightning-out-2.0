import { useState } from "react";

const LightningOutApp = () => {
  const TARGET_USER = "hasijajassi02@gmail.com";

  const [email, setEmail] = useState(""); // email entered by user
  const [currentEmail, setCurrentEmail] = useState(""); // email passed to LWC
  const [logStatus, setLogStatus] = useState("");

  const startLWC = async (userEmail) => {
    setLogStatus(`Connecting as ${TARGET_USER}...`);

    try {
      const response = await fetch(
        `/api/get-url?username=${encodeURIComponent(TARGET_USER)}`
      );
      const result = await response.json();

      if (!result.success || !result.url) throw new Error("Salesforce Auth Failed");

      setLogStatus("Session active. Bootstrapping Lightning Out 2.0...");

      // 🔹 Salesforce-provided Lightning Out 2.0 script
      const script = document.createElement("script");
      script.src =
        "https://algocirrus-b6-dev-ed.develop.my.salesforce.com/lightning/lightning.out.latest/index.iife.prod.js";
      script.async = true;

      script.onload = () => {
        const loApp = document.querySelector("lightning-out-application");
        if (!loApp) throw new Error("Lightning Out application not found");

        // Keep frontdoor-url as received from API
        loApp.setAttribute("frontdoor-url", result.url);

        // After everything is ready, pass email to LWC
        setCurrentEmail(userEmail);
        console.log("Email passed to LWC:", userEmail);
      };

      document.body.appendChild(script);
    } catch (err) {
      console.error(err);
      setLogStatus("Runtime error: " + err.message);
    }
  };

  const handleShowLWC = () => {
    if (!email) {
      alert("Please enter an email!");
      return;
    }
    startLWC(email);
  };

  return (
    <>
      {/* 🔹 Padded div for input and log only */ }
      <div style={ { padding: "20px" } }>
        {/* User input */ }
        <div style={ { marginBottom: "16px" } }>
          <input
            type="email"
            placeholder="Enter email"
            value={ email }
            onChange={ (e) => setEmail(e.target.value) }
            style={ { padding: "6px", width: "1000px", marginRight: "8px" } }
          />
          <button onClick={ handleShowLWC }>Show LWC Component</button>
        </div>

        { logStatus && <p>{ logStatus }</p> }
      </div>

      <lightning-out-application
        app-id="1UsNS0000000CUD0A2"
        components="c-hello-world-lwc"
      ></lightning-out-application>

      <div style={ { marginTop: '20px', color: 'blue' } }>
        <p>LWC Loaded Below:</p>
        <c-hello-world-lwc email={ currentEmail }></c-hello-world-lwc>
      </div>
    </>
  );
};

export default LightningOutApp;