import React, { useEffect, useState } from 'react';

const LightningContainer = ({ frontdoorUrl }) => {
    const [isReady, setIsReady] = useState(false);

    // PASTE YOUR VALUES HERE FROM THE LIGHTNING OUT 2.0 APP MANAGER
    const LIGHTNING_OUT_APP_ID = "1Usxxxxxxxxxxxxxxx"; // The 18-digit ID
    const TARGET_LWC = "c-hello-world-lwc";           // The kebab-case name of your LWC

    useEffect(() => {
        const lightningApp = document.getElementById('lightning-app');

        const handleReady = () => {
            console.log("LO 2.0: Salesforce session established!");
            setIsReady(true);
        };

        if (lightningApp) {
            lightningApp.addEventListener('lo.application.ready', handleReady);
        }

        return () => {
            if (lightningApp) {
                lightningApp.removeEventListener('lo.application.ready', handleReady);
            }
        };
    }, [frontdoorUrl]);

    return (
        <div style={ { padding: '20px', border: '1px solid #ccc', marginTop: '20px' } }>
            <h3>Salesforce Lightning Out 2.0</h3>

            {/* LO 2.0 ATTRIBUTES:
                - app-id: Mandatory 18-digit ID from App Manager
                - components: Comma-separated list of LWCs allowed to load
            */}
            <lightning-out-application
                id="lightning-app"
                app-id={ LIGHTNING_OUT_APP_ID }
                frontdoor-url={ frontdoorUrl }
                components={ TARGET_LWC }
                container-type="standard"
            ></lightning-out-application>

            {/* The LWC will only be visible once the session is ready */ }
            <div style={ { display: isReady ? 'block' : 'none', minHeight: '150px' } }>
                <c-hello-world-lwc message="Successfully connected via LO 2.0!"></c-hello-world-lwc>
            </div>

            { !isReady && (
                <div className="loader">
                    <p>🔄 Establishing Secure Salesforce Bridge...</p>
                </div>
            ) }
        </div>
    );
};

export default LightningContainer;