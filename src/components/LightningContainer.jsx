import React, { useEffect, useState } from 'react';

const LightningContainer = ({ frontdoorUrl }) => {
    const [isReady, setIsReady] = useState(false);

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
    }, []);
    console.log('frontdoorUrl' + frontdoorUrl);

    return (
        <div style={ { padding: '20px', border: '1px solid #ccc', marginTop: '20px' } }>
            <h3>Salesforce Lightning Out 2.0</h3>
            {/* The core LO 2.0 Element */ }
            <lightning-out-application
                app-id="1UsNS0000000CUD0A2"
                frontdoor-url={ frontdoorUrl }
                continer-type="standard"
                components="c-hello-world-lwc"
            ></lightning-out-application>

            <c-hello-world-lwc></c-hello-world-lwc>
            {/* Your actual LWC - it will "wait" for the app above to log in */ }
            { frontdoorUrl && (
                <div style={ { display: isReady ? 'block' : 'none' } }>
                </div>
            ) }

            { !isReady && <p>Connecting to Salesforce Securely...</p> }
        </div>
    );
};

export default LightningContainer;
