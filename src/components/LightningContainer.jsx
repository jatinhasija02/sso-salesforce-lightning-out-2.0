import React, { useEffect, useState } from 'react';

const LightningContainer = ({ frontdoorUrl }) => {
    const [isReady, setIsReady] = useState(false);
    const [authError, setAuthError] = useState(false);

    // Auth0 Details
    const domain = "dev-sf4mdxnyt4bvy3np.us.auth0.com";
    const clientId = "pkJRoRqgVGgxE1E5pbNfRGibCdoIQ2jC";
    const callback = encodeURIComponent(window.location.origin);
    const AUTH0_SSO_URL = `https://${domain}/authorize?response_type=code&client_id=${clientId}&redirect_uri=${callback}&scope=openid%20profile%20email`;

    useEffect(() => {
        const loApp = document.getElementById('lightning-app');

        // Start a 10-second timer
        const redirectTimer = setTimeout(() => {
            if (!isReady) {
                console.warn("Salesforce bridge hung. Redirecting to Auth0...");
                window.location.href = AUTH0_SSO_URL;
            }
        }, 6000);

        const handleReady = () => {
            console.log("✅ LO 2.0 EVENT: lo.application.ready - Bridge Established");
            setIsReady(true);
            clearTimeout(redirectTimer); // Success! Stop the redirect.
        };

        const handleError = (error) => {
            console.error("❌ LO 2.0 ERROR:", error.detail);
            setAuthError(true);
            clearTimeout(redirectTimer);
        };

        if (loApp) {
            loApp.addEventListener('lo.application.ready', handleReady);
            loApp.addEventListener('lo.application.error', handleError);
        }

        return () => {
            clearTimeout(redirectTimer);
            if (loApp) {
                loApp.removeEventListener('lo.application.ready', handleReady);
                loApp.removeEventListener('lo.application.error', handleError);
            }
        };
    }, [frontdoorUrl, isReady, AUTH0_SSO_URL]);

    if (authError) {
        return (
            <div style={ { padding: '20px', color: 'red', border: '1px solid red' } }>
                <p>⚠️ Connection blocked by Salesforce security.</p>
                <button onClick={ () => window.location.href = AUTH0_SSO_URL }>
                    Retry Auth0 Login
                </button>
            </div>
        );
    }

    return (
        <div style={ { padding: '20px', border: '1px solid #ccc', marginTop: '20px', minHeight: '200px' } }>
            <h3>Salesforce Lightning Out 2.0</h3>

            <lightning-out-application
                id="lightning-app"
                app-id="1UsNS0000000CUD0A2"
                frontdoor-url={ frontdoorUrl }
                components="c-hello-world-lwc"
                container-type="standard"
            ></lightning-out-application>

            { isReady ? (
                <c-hello-world-lwc></c-hello-world-lwc>
            ) : (
                <p>🔄 Establishing Secure Bridge... If this fails, you will be redirected to Auth0.</p>
            ) }
        </div>
    );
};

export default LightningContainer;