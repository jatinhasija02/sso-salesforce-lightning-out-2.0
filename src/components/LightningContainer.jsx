import React, { useEffect, useState } from 'react';

const LightningContainer = ({ frontdoorUrl }) => {
    const [isReady, setIsReady] = useState(false);
    const [authError, setAuthError] = useState(false);

    useEffect(() => {
        // Initial Debug Logs
        console.group("LO 2.0 Debug: Initialization");
        console.log("Current Origin:", window.location.origin);
        console.log("Frontdoor URL Provided:", frontdoorUrl ? JSON.stringify(frontdoorUrl) : "No");
        console.groupEnd();

        const loApp = document.getElementById('lightning-app');

        const handleReady = () => {
            console.log("✅ LO 2.0 EVENT: lo.application.ready - Bridge Established");
            setIsReady(true);
        };

        const handleError = (error) => {
            console.group("❌ LO 2.0 EVENT: lo.application.error");
            console.error("Error Detail:", error.detail);
            console.log("Note: This often means the domain is not in Salesforce 'Trusted Domains for Inline Frames'.");
            console.groupEnd();
            setAuthError(true);
        };

        if (loApp) {
            loApp.addEventListener('lo.application.ready', handleReady);
            loApp.addEventListener('lo.application.error', handleError);
        }

        return () => {
            if (loApp) {
                loApp.removeEventListener('lo.application.ready', handleReady);
                loApp.removeEventListener('lo.application.error', handleError);
            }
        };
    }, [frontdoorUrl]);

    if (authError) {
        return (
            <div style={ { padding: '20px', color: 'red', border: '1px solid red' } }>
                <p>⚠️ Authentication failed. Salesforce blocked the connection.</p>
                <p style={ { fontSize: '12px' } }>Open the Browser Console (F12) to see the specific error detail.</p>
                <a href={ frontdoorUrl } target="_blank" rel="noreferrer" style={ { color: 'blue', textDecoration: 'underline' } }>
                    Click here to manually authorize
                </a>
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
                <p>🔄 Establishing Secure Bridge... Check console for status.</p>
            ) }
        </div>
    );
};

export default LightningContainer;