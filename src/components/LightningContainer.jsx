import React, { useEffect, useState } from 'react';

const LightningContainer = ({ frontdoorUrl }) => {
    const [isReady, setIsReady] = useState(false);

    // AUTH0 CONFIG
    const domain = "dev-sf4mdxnyt4bvy3np.us.auth0.com";
    const clientId = "SPlY0dELRN3uccQkHWAitNVM2v0UWJPv";
    const callback = encodeURIComponent(window.location.origin);

    // ADDED: prompt=login forces Auth0 to show the login screen every time
    const FORCE_LOGIN_URL = `https://${domain}/authorize?response_type=code&client_id=${clientId}&redirect_uri=${callback}&scope=openid%20profile%20email&prompt=login`;

    useEffect(() => {
        const loApp = document.getElementById('lightning-app');

        // Start a 6-second timer. 
        // If Salesforce says "frame-ancestors 'none'", the bridge will hang.
        const timer = setTimeout(() => {
            if (!isReady) {
                console.error("CSP Violation Blocked Iframe. Forcing Hard Login...");
                window.location.href = FORCE_LOGIN_URL;
            }
        }, 6000);

        const handleReady = () => {
            console.log("✅ Salesforce Bridge Established!");
            setIsReady(true);
            clearTimeout(timer);
            localStorage.removeItem('sso_retry_active');
        };

        if (loApp) {
            loApp.addEventListener('lo.application.ready', handleReady);
            loApp.addEventListener('lo.application.error', () => {
                clearTimeout(timer);
                window.location.href = FORCE_LOGIN_URL;
            });
        }

        return () => clearTimeout(timer);
    }, [isReady, FORCE_LOGIN_URL]);

    return (
        <div style={ { padding: '20px', border: '1px solid #ccc', minHeight: '300px' } }>
            <lightning-out-application
                id="lightning-app"
                app-id="1UsNS0000000CUD0A2"
                frontdoor-url={ frontdoorUrl }
                components="c-hello-world-lwc"
                container-type="standard"
            ></lightning-out-application>

            { !isReady && <p>🔄 Syncing Salesforce Session...</p> }
            { isReady && <c-hello-world-lwc></c-hello-world-lwc> }
        </div>
    );
};

export default LightningContainer;