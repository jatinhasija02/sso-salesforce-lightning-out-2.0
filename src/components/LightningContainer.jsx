import React, { useEffect, useState } from 'react';

const LightningContainer = ({ frontdoorUrl }) => {
    const [isReady, setIsReady] = useState(false);

    // YOUR AUTH0 SSO LINK
    const domain = "dev-sf4mdxnyt4bvy3np.us.auth0.com";
    const clientId = "SPlY0dELRN3uccQkHWAitNVM2v0UWJPv";
    const callback = encodeURIComponent(window.location.origin);
    const AUTH0_LOGIN_URL = `https://${domain}/authorize?response_type=code&client_id=${clientId}&redirect_uri=${callback}&scope=openid%20profile%20email`;

    useEffect(() => {
        const loApp = document.getElementById('lightning-app');

        // IF THE BRIDGE HANGS (due to CSP 'none'), NAVIGATE
        const timeoutDuration = 5000; // 5 seconds is enough to know it's blocked
        const navigationTimer = setTimeout(() => {
            if (!isReady) {
                console.error("CSP 'frame-ancestors' violation detected. Navigating to main login...");
                window.location.href = AUTH0_LOGIN_URL; // <--- HARD NAVIGATION
            }
        }, timeoutDuration);

        const handleReady = () => {
            console.log("✅ Bridge Established Successfully!");
            setIsReady(true);
            clearTimeout(navigationTimer);
        };

        const handleError = () => {
            console.log("❌ Bridge Error Caught. Navigating...");
            clearTimeout(navigationTimer);
            window.location.href = AUTH0_LOGIN_URL;
        };

        if (loApp) {
            loApp.addEventListener('lo.application.ready', handleReady);
            loApp.addEventListener('lo.application.error', handleError);
        }

        return () => {
            clearTimeout(navigationTimer);
            if (loApp) {
                loApp.removeEventListener('lo.application.ready', handleReady);
                loApp.removeEventListener('lo.application.error', handleError);
            }
        };
    }, [isReady, AUTH0_LOGIN_URL]);

    return (
        <div style={ { padding: '20px', border: '1px solid #ccc', minHeight: '250px' } }>
            <lightning-out-application
                id="lightning-app"
                app-id="1UsNS0000000CUD0A2"
                frontdoor-url={ frontdoorUrl }
                components="c-hello-world-lwc"
                container-type="standard"
            ></lightning-out-application>

            { !isReady && (
                <div style={ { textAlign: 'center' } }>
                    <p>🔄 Securing Bridge... Please wait.</p>
                </div>
            ) }

            { isReady && <c-hello-world-lwc></c-hello-world-lwc> }
        </div>
    );
};

export default LightningContainer;