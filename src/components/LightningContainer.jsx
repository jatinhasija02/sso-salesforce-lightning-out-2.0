import React, { useEffect, useState } from 'react';

const LightningContainer = ({ frontdoorUrl }) => {
    const [isReady, setIsReady] = useState(false);
    const [authError, setAuthError] = useState(false);

    useEffect(() => {
        const loApp = document.getElementById('lightning-app');

        const handleReady = () => {
            console.log("LO 2.0: Ready");
            setIsReady(true);
        };

        const handleError = (error) => {
            console.error("LO 2.0 Connection Error:", error);
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
    }, []);

    if (authError) {
        return (
            <div style={ { padding: '20px', color: 'red', border: '1px solid red' } }>
                <p>⚠️ Authentication failed. Salesforce blocked the connection.</p>
                <p style={ { fontSize: '12px' } }>Ensure your domain is in Salesforce "Trusted Domains for Inline Frames".</p>
                <a href={ frontdoorUrl } target="_blank" rel="noreferrer" style={ { color: 'blue', textDecoration: 'underline' } }>
                    Click here to manually authorize
                </a>
            </div>
        );
    }

    return (
        <div style={ { padding: '20px', border: '1px solid #ccc', marginTop: '20px', minHeight: '200px' } }>
            <h3>Salesforce Lightning Out 2.0</h3>

            {/* Bridge Element */ }
            <lightning-out-application
                id="lightning-app"
                app-id="1UsNS0000000CUD0A2"
                frontdoor-url={ frontdoorUrl }
                components="c-hello-world-lwc"
                container-type="standard"
            ></lightning-out-application>

            {/* ONLY render the LWC tag if isReady is true. 
                This prevents the browser from making requests before the session exists. */}
            { isReady ? (
                <c-hello-world-lwc></c-hello-world-lwc>
            ) : (
                <p>🔄 Establishing Secure Bridge...</p>
            ) }
        </div>
    );
};

export default LightningContainer;