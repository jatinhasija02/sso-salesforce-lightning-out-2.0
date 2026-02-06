// src/components/LightningContainer.jsx
import React, { useEffect, useState } from 'react';

const LightningContainer = ({ frontdoorUrl }) => {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const loApp = document.getElementById('lightning-app');

        const handleReady = () => {
            console.log("LO 2.0: Salesforce session established!");
            setIsReady(true);
        };

        if (loApp) {
            loApp.addEventListener('lo.application.ready', handleReady);
        }

        return () => {
            if (loApp) {
                loApp.removeEventListener('lo.application.ready', handleReady);
            }
        };
    }, []);

    return (
        <div style={ { padding: '20px', border: '1px solid #ccc', marginTop: '20px', minHeight: '200px' } }>
            <lightning-out-application
                id="lightning-app"
                app-id="1UsNS0000000CUD0A2"
                frontdoor-url={ frontdoorUrl }
                components="c-hello-world-lwc"
                container-type="standard"
            ></lightning-out-application>

            <c-hello-world-lwc></c-hello-world-lwc>
            { isReady ? (<p>Ready to Secure Connection...</p>
            ) : (
                <p>Establishing Secure Connection...</p>
            ) }
        </div>
    );
};

export default LightningContainer;