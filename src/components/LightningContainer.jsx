import React, { useEffect, useState, useRef } from 'react';

const LightningContainer = ({ frontdoorUrl }) => {
    const [isReady, setIsReady] = useState(false);
    const containerRef = useRef(null);

    // Using the frontdoorUrl as a dependency ensures we reset state 
    // when a new email is entered
    useEffect(() => {
        setIsReady(false);

        // 1. CLEANUP: Remove any existing lo-app elements to prevent user leakage
        const existingApp = document.getElementById('lightning-app');
        if (existingApp) {
            existingApp.remove();
        }

        if (!frontdoorUrl) return;

        // 2. CREATE NEW: Force a fresh element for the specific user entered
        const loApp = document.createElement('lightning-out-application');
        loApp.setAttribute('id', 'lightning-app');
        loApp.setAttribute('app-id', '1UsNS0000000CUD0A2');
        loApp.setAttribute('frontdoor-url', frontdoorUrl);
        loApp.setAttribute('container-type', 'standard');
        loApp.setAttribute('components', 'c-hello-world-lwc');

        const handleReady = () => {
            console.log("LO 2.0: Fresh session established for entry.");
            setIsReady(true);
        };

        loApp.addEventListener('lo.application.ready', handleReady);

        if (containerRef.current) {
            containerRef.current.appendChild(loApp);
        }

        return () => {
            loApp.removeEventListener('lo.application.ready', handleReady);
        };
    }, [frontdoorUrl]); // TRIGGERS EVERY TIME EMAIL CHANGES

    return (
        <div style={ { padding: '20px', border: '1px solid #ccc', marginTop: '20px' } }>
            <h3>Dynamic Salesforce Portal</h3>

            <div ref={ containerRef }></div>

            { isReady ? (
                /* The key={frontdoorUrl} forces the LWC to re-render from scratch */
                <c-hello-world-lwc key={ frontdoorUrl }></c-hello-world-lwc>
            ) : (
                <p>🔄 Switching to user session...</p>
            ) }
        </div>
    );
};

export default LightningContainer;