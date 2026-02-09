import React, { useEffect, useState } from 'react';

const LightningContainer = ({ frontdoorUrl }) => {
    const [isReady, setIsReady] = useState(false);

    // BUILD THE AUTH0 LINK
    const domain = "dev-sf4mdxnyt4bvy3np.us.auth0.com";
    const clientId = "pkJRoRqgVGgxE1E5pbNfRGibCdoIQ2jC";
    const callback = encodeURIComponent(window.location.origin); // Dynamic redirect back to your app

    const AUTH0_SSO_URL = `https://${domain}/authorize?response_type=code&client_id=${clientId}&redirect_uri=${callback}&scope=openid%20profile%20email`;

    useEffect(() => {
        // Set a timer for 8 seconds
        const redirectTimer = setTimeout(() => {
            if (!isReady) {
                console.warn("Salesforce bridge hung. Redirecting to Auth0...");
                window.location.href = AUTH0_SSO_URL;
            }
        }, 8000);

        const loApp = document.getElementById('lightning-app');

        const handleReady = () => {
            console.log("✅ Bridge Ready");
            setIsReady(true);
            clearTimeout(redirectTimer);
        };

        if (loApp) {
            loApp.addEventListener('lo.application.ready', handleReady);
        }

        return () => {
            clearTimeout(redirectTimer);
            if (loApp) loApp.removeEventListener('lo.application.ready', handleReady);
        };
    }, [isReady, AUTH0_SSO_URL]);

    return (
        <div>
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
                <p>🔄 Establishing Secure Bridge... If this fails, you'll be redirected to Auth0.</p>
            ) }
        </div>
    );
};

export default LightningContainer;