import React, { useEffect, useState } from 'react';

const LightningContainer = ({ frontdoorUrl }) => {
    const [isReady, setIsReady] = useState(false);
    const [authError, setAuthError] = useState(false);

    useEffect(() => {
        // 1. Find the application element
        const loApp = document.getElementById('lightning-app');

        const handleReady = () => {
            console.log("LO 2.0: Secure Bridge Established! Rendering LWC now.");
            setIsReady(true);
        };

        const handleError = (error) => {
            console.error("LO 2.0 Connection Error:", error);
            // This triggers if cookies are blocked OR if the frame-ancestors policy fails
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
                <p>⚠️ <strong>Connection Blocked:</strong> Salesforce session could not be established.</p>
                <p style={ { fontSize: '14px' } }>If you are in Incognito, Chrome blocks the cookies needed for this bridge.</p>
                <a href={ frontdoorUrl } target="_blank" rel="noreferrer"
                    style={ { display: 'inline-block', marginTop: '10px', padding: '10px', background: '#0070d2', color: '#fff', borderRadius: '4px', textDecoration: 'none' } }>
                    Click here to open Salesforce and Fix
                </a>
            </div>
        );
    }

    return (
        <div style={ { padding: '20px', border: '1px solid #ccc', marginTop: '20px', minHeight: '250px' } }>
            <h3>Salesforce Lightning Out 2.0</h3>

            {/* The Bridge Element:
               By having this here ALONE, it focuses on setting the cookie first.
            */}
            <lightning-out-application
                id="lightning-app"
                app-id="1UsNS0000000CUD0A2"
                frontdoor-url={ frontdoorUrl }
                components="c-hello-world-lwc"
                container-type="standard"
            ></lightning-out-application>

            {/* CRITICAL CHANGE: 
               We ONLY render the <c-hello-world-lwc> tag if isReady is TRUE.
               This prevents the "frame-ancestors" error from firing on a blank session.
            */}
            { isReady ? (
                <div className="lwc-content">
                    <c-hello-world-lwc message="Session established via dynamic handshake!"></c-hello-world-lwc>
                </div>
            ) : (
                <div style={ { textAlign: 'center', padding: '40px' } }>
                    <p>🔄 Establishing Secure Salesforce Bridge...</p>
                    <p style={ { fontSize: '11px', color: '#888' } }>
                        Establishing session via JWT + Frontdoor
                    </p>
                </div>
            ) }
        </div>
    );
};

export default LightningContainer;