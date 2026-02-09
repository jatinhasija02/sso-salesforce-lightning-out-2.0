import React, { useEffect, useState } from 'react';

const LightningContainer = ({ frontdoorUrl }) => {
    const [isReady, setIsReady] = useState(false);
    const [authError, setAuthError] = useState(false);

    // Hardcoded redirect link
    const FALLBACK_URL = "https://login.salesforce.com/";

    useEffect(() => {
        const loApp = document.getElementById('lightning-app');

        // 1. START A TIMER
        // If 'isReady' doesn't become true in 7 seconds, redirect the user.
        const redirectTimer = setTimeout(() => {
            if (!isReady) {
                console.warn("SSO Bridge failed to connect. Redirecting to manual login...");
                window.location.href = FALLBACK_URL; // <--- HARD REDIRECT
            }
        }, 7000); // 7 seconds timeout

        const handleReady = () => {
            console.log("✅ LO 2.0 EVENT: lo.application.ready");
            setIsReady(true);
            clearTimeout(redirectTimer); // Stop the timer if we succeed!
        };

        const handleError = (error) => {
            console.error("❌ LO 2.0 ERROR", error.detail);
            setAuthError(true);
            clearTimeout(redirectTimer); // Stop timer and show the error UI instead
        };

        if (loApp) {
            loApp.addEventListener('lo.application.ready', handleReady);
            loApp.addEventListener('lo.application.error', handleError);
        }

        return () => {
            clearTimeout(redirectTimer); // Cleanup on unmount
            if (loApp) {
                loApp.removeEventListener('lo.application.ready', handleReady);
                loApp.removeEventListener('lo.application.error', handleError);
            }
        };
    }, [frontdoorUrl, isReady]);

    if (authError) {
        return (
            <div style={ { padding: '20px', color: 'red' } }>
                <p>⚠️ Salesforce blocked the connection.</p>
                <button onClick={ () => window.location.href = FALLBACK_URL }>
                    Go to Login Page
                </button>
            </div>
        );
    }

    return (
        <div style={ { padding: '20px', border: '1px solid #ccc', marginTop: '20px' } }>
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
                <p>🔄 Establishing Secure Bridge... If this takes too long, you will be redirected.</p>
            ) }
        </div>
    );
};

export default LightningContainer;