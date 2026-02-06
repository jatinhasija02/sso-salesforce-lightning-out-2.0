import React, { useEffect, useState, useRef } from 'react';

const LightningContainer = ({ frontdoorUrl }) => {
    const [isReady, setIsReady] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        setIsReady(false);

        // 1. Physically remove old elements
        const oldApp = document.getElementById('lightning-app');
        if (oldApp) oldApp.remove();

        if (!frontdoorUrl) return;

        // 2. Create the element dynamically with a UNIQUE ID for this session
        const loApp = document.createElement('lightning-out-application');
        loApp.setAttribute('id', 'lightning-app');
        loApp.setAttribute('app-id', '1UsNS0000000CUD0A2');
        loApp.setAttribute('frontdoor-url', frontdoorUrl);
        loApp.setAttribute('container-type', 'standard');
        loApp.setAttribute('components', 'c-hello-world-lwc');

        const handleReady = () => {
            console.log("LO 2.0: Fresh session confirmed.");
            setIsReady(true);
        };

        loApp.addEventListener('lo.application.ready', handleReady);

        if (containerRef.current) {
            containerRef.current.appendChild(loApp);
        }

        return () => {
            loApp.removeEventListener('lo.application.ready', handleReady);
        };
    }, [frontdoorUrl]); // Dependency on the URL forces re-run on email change

    return (
        <div style={ { padding: '20px', border: '1px solid #ccc', marginTop: '20px' } }>
            <div ref={ containerRef }></div>

            { isReady ? (
                // Adding a key here ensures the LWC is re-rendered entirely
                <c-hello-world-lwc key={ frontdoorUrl }></c-hello-world-lwc>
            ) : (
                <p>🔄 Initializing Dynamic User Session...</p>
            ) }
        </div>
    );
};

export default LightningContainer;