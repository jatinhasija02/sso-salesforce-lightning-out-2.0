import React, { useEffect, useState } from 'react';

const LightningContainer = ({ frontdoorUrl }) => {
    const [isReady, setIsReady] = useState(false);
    const [authError, setAuthError] = useState(false);


    useEffect(() => {
        const lightningApp = document.getElementById('lightning-app');

        const handleReady = () => {
            console.log("LO 2.0: Ready");
            setIsReady(true);
        };

        const handleError = (error) => {
            console.error("LO 2.0 Connection Error:", error);
            // This usually triggers if cookies are blocked in Incognito
            setAuthError(true);
        };

        if (lightningApp) {
            lightningApp.addEventListener('lo.application.ready', handleReady);
            lightningApp.addEventListener('lo.application.error', handleError);
        }

        return () => {
            if (lightningApp) {
                lightningApp.removeEventListener('lo.application.ready', handleReady);
                lightningApp.removeEventListener('lo.application.error', handleError);
            }
        };
    }, []);

    if (authError) {
        return (
            <div style={ { padding: '20px', color: 'red' } }>
                <p>⚠️ Authentication failed. This usually happens in Incognito mode if third-party cookies are blocked.</p>
                <a href={ frontdoorUrl } target="_blank" rel="noreferrer" style={ { color: 'blue', textDecoration: 'underline' } }>
                    Click here to manually authorize Salesforce
                </a>
            </div>
        );
    }

    return (
        <div style={ { padding: '20px', border: '1px solid #ccc', marginTop: '20px' } }>
            <h3>Salesforce Lightning Out 2.0</h3>

            <lightning-out-application
                app-id="1UsNS0000000CUD0A2"
                frontdoor-url={ frontdoorUrl }
                components="c-hello-world-lwc"
                container-type="standard"
            ></lightning-out-application>

            <c-hello-world-lwc></c-hello-world-lwc>

            <div style={ { display: isReady ? 'block' : 'none' } }>
            </div>

            { !isReady && <p>🔄 Establishing Secure Bridge (Check Trusted Domains if stuck)...</p> }
        </div>
    );
};

export default LightningContainer;