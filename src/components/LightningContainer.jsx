import React, { useEffect, useState } from 'react';

const LightningContainer = ({ frontdoorUrl, userEmail }) => {
    const [isReady, setIsReady] = useState(false);
    const [isCleaning, setIsCleaning] = useState(false);

    useEffect(() => {
        const resetSessionAndLoad = async () => {
            console.log(`Switching user to: ${userEmail}`);
            setIsReady(false);
            setIsCleaning(true);

            // STEP 1: SILENT LOGOUT
            // This clears the 'sid' cookie from the browser for the Salesforce domain
            try {
                // We use 'no-cors' because we don't need to read the response, 
                // we just need the browser to hit the URL to drop the cookies.
                await fetch(`${new URL(frontdoorUrl).origin}/secur/logout.jsp`, { mode: 'no-cors' });
                console.log("Old session cleared.");
            } catch (e) {
                console.warn("Logout ping failed, proceeding anyway...");
            }

            // Small delay to ensure browser handles cookie deletion
            setTimeout(() => {
                setIsCleaning(false);
            }, 800);
        };

        if (frontdoorUrl) {
            resetSessionAndLoad();
        }
    }, [frontdoorUrl, userEmail]); // Runs whenever the user or URL changes

    if (isCleaning) {
        return <p>🔒 Switching secure sessions...</p>;
    }

    return (
        <div style={ { padding: '20px', border: '1px solid #ccc', marginTop: '20px' } }>
            <lightning-out-application
                id="lightning-app"
                app-id="1UsNS0000000CUD0A2"
                frontdoor-url={ frontdoorUrl }
                components="c-hello-world-lwc"
                onready={ () => setIsReady(true) }
            ></lightning-out-application>

            { isReady ? <c-hello-world-lwc></c-hello-world-lwc> : <p>🔄 Loading LWC for { userEmail }...</p> }
        </div>
    );
};

export default LightningContainer;