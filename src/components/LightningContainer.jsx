import React, { useEffect, useState } from 'react';

const LightningContainer = ({ frontdoorUrl, userEmail }) => {
    const [isReady, setIsReady] = useState(false);
    const [isCleaning, setIsCleaning] = useState(false);
    const [renderApp, setRenderApp] = useState(false);

    useEffect(() => {
        const resetSessionAndLoad = async () => {
            console.log(`Switching user to: ${userEmail}`);

            // 1. Unmount the app immediately to clear the DOM
            setRenderApp(false);
            setIsReady(false);
            setIsCleaning(true);

            // 2. SILENT LOGOUT: Force browser to drop old Salesforce cookies
            try {
                const logoutUrl = `${new URL(frontdoorUrl).origin}/secur/logout.jsp`;
                await fetch(logoutUrl, { mode: 'no-cors' });
                console.log("Old session cleared.");
            } catch (e) {
                console.warn("Logout ping failed, likely CORS-blocked but usually still drops cookies.");
            }

            // 3. Wait slightly for the browser to process cookie deletion
            // then trigger a fresh mount of the LO application tag
            setTimeout(() => {
                setIsCleaning(false);
                setRenderApp(true);
            }, 1000);
        };

        if (frontdoorUrl) {
            resetSessionAndLoad();
        }
    }, [frontdoorUrl, userEmail]);

    if (isCleaning) {
        return (
            <div style={ { padding: '20px', textAlign: 'center' } }>
                <p>🔒 Security Handshake: Authenticating { userEmail }...</p>
            </div>
        );
    }

    return (
        <div style={ { padding: '20px', border: '1px solid #ccc', marginTop: '20px' } }>
            { renderApp && (
                <>
                    {/* The Bridge Tag */ }
                    <lightning-out-application
                        id="lightning-app"
                        app-id="1UsNS0000000CUD0A2"
                        frontdoor-url={ frontdoorUrl }
                        components="c-hello-world-lwc"
                        onready={ () => {
                            console.log("✅ New session bridge ready for:", userEmail);
                            setIsReady(true);
                        } }
                        onerror={ (e) => console.error("Handshake Error:", e) }
                    ></lightning-out-application>

                    {/* The LWC Tag */ }
                    { isReady ? (
                        <c-hello-world-lwc></c-hello-world-lwc>
                    ) : (
                        <p>🔄 Initializing components for { userEmail }...</p>
                    ) }
                </>
            ) }
        </div>
    );
};

export default LightningContainer;