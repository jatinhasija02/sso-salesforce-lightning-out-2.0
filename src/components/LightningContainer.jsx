import React, { useEffect, useState } from 'react';

const LightningContainer = ({ frontdoorUrl }) => {
    const [isReady, setIsReady] = useState(false);

    const domain = "dev-sf4mdxnyt4bvy3np.us.auth0.com";
    const clientId = "pkJRoRqgVGgxE1E5pbNfRGibCdoIQ2jC";
    const callback = encodeURIComponent(window.location.origin);
    const AUTH0_URL = `https://${domain}/authorize?response_type=code&client_id=${clientId}&redirect_uri=${callback}&scope=openid%20profile%20email&prompt=login`;

    useEffect(() => {
        const loApp = document.getElementById('lightning-app');

        // KILL THE TIMER if we already have an active retry or are currently processing an auth code
        const isRetrying = sessionStorage.getItem('sso_retry_active') === 'true';

        if (isRetrying) {
            console.log("[LOG] Auth process in progress. Redirect timer disabled.");
            return;
        }

        const timer = setTimeout(() => {
            if (!isReady) {
                console.error("[LOG] 🚨 Bridge HUNG. Final attempt: Redirecting to Auth0...");
                // Set flag so we don't redirect again when we return
                sessionStorage.setItem('sso_retry_active', 'true');
                window.location.href = AUTH0_URL;
            }
        }, 12000); // Increased to 12s to give Salesforce time to respond

        const handleReady = () => {
            console.log("✅ [LOG] Bridge Ready!");
            setIsReady(true);
            clearTimeout(timer);
            // Success! Allow future retries if the session eventually expires
            sessionStorage.removeItem('sso_retry_active');
        };

        if (loApp) {
            loApp.addEventListener('lo.application.ready', handleReady);
        }

        return () => {
            clearTimeout(timer);
            if (loApp) loApp.removeEventListener('lo.application.ready', handleReady);
        };
    }, [isReady, AUTH0_URL]);

    return (
        <div style={ { padding: '20px', border: '1px solid #ccc', minHeight: '300px' } }>
            <lightning-out-application
                id="lightning-app"
                app-id="1UsNS0000000CUD0A2"
                frontdoor-url={ frontdoorUrl }
                components="c-hello-world-lwc"
                container-type="standard"
            ></lightning-out-application>

            { !isReady ? (
                <div style={ { marginTop: '50px' } }>
                    <p>🔄 Establishing Secure Bridge...</p>
                    <p style={ { fontSize: '11px', color: 'gray' } }>Waiting for Salesforce to authorize frame...</p>
                </div>
            ) : (
                <div style={ { marginTop: '20px', color: 'blue' } }>
                    <p>LWC Loaded Below:</p>
                    <c-hello-world-lwc></c-hello-world-lwc>
                </div>
            ) }
        </div>
    );
};

export default LightningContainer;