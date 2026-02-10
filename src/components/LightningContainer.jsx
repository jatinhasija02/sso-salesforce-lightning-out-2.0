import React, { useEffect, useState } from 'react';

const LightningContainer = ({ frontdoorUrl }) => {
    const [isReady, setIsReady] = useState(false);

    // Auth0 Configuration
    const domain = "dev-sf4mdxnyt4bvy3np.us.auth0.com";
    const clientId = "SPlY0dELRN3uccQkHWAitNVM2v0UWJPv";
    const callback = encodeURIComponent(window.location.origin);

    // This is the link that forces the browser to refresh its Auth0 session
    const AUTH0_SSO_URL = `https://${domain}/authorize?response_type=code&client_id=${clientId}&redirect_uri=${callback}&scope=openid%20profile%20email`;

    useEffect(() => {
        const loApp = document.getElementById('lightning-app');

        // Start a timer. If Salesforce doesn't say "Ready" in 8s, redirect.
        const timer = setTimeout(() => {
            if (!isReady) {
                console.warn("Lightning Out 2.0 Hung. Forcing Auth0 Refresh...");
                window.location.href = AUTH0_SSO_URL;
            }
        }, 8000);

        const handleReady = () => {
            console.log("✅ Salesforce Bridge Established!");
            setIsReady(true);
            clearTimeout(timer);
        };

        const handleError = (err) => {
            console.error("❌ Salesforce Bridge Error:", err.detail);
            clearTimeout(timer);
            // Optionally redirect immediately on error
            window.location.href = AUTH0_SSO_URL;
        };

        if (loApp) {
            loApp.addEventListener('lo.application.ready', handleReady);
            loApp.addEventListener('lo.application.error', handleError);
        }

        return () => {
            clearTimeout(timer);
            if (loApp) {
                loApp.removeEventListener('lo.application.ready', handleReady);
                loApp.removeEventListener('lo.application.error', handleError);
            }
        };
    }, [isReady, AUTH0_SSO_URL]);

    return (
        <div style={ { padding: '20px', border: '1px solid #ccc', minHeight: '300px' } }>
            <lightning-out-application
                id="lightning-app"
                app-id="1UsNS0000000CUD0A2"
                frontdoor-url={ frontdoorUrl }
                components="c-hello-world-lwc"
                container-type="standard"
            ></lightning-out-application>

            { !isReady && (
                <div style={ { marginTop: '50px' } }>
                    <p>🔄 Connecting to Salesforce Secure Bridge...</p>
                    <small>If this hangs, we will automatically refresh your login.</small>
                </div>
            ) }

            {/* The actual LWC is injected here once ready */ }
            { isReady && <c-hello-world-lwc></c-hello-world-lwc> }
        </div>
    );
};

export default LightningContainer;