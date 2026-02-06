import React, { useEffect, useRef, useState } from 'react';

const LightningContainer = ({ accessToken, instanceUrl }) => {
    const [error, setError] = useState(null);
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        // Function to initialize Lightning
        const initLightning = () => {
            console.log("Initializing Lightning Out 2.0...");
            window.$Lightning.use(
                "c:LightningOutApp",
                function () {
                    window.$Lightning.createComponent(
                        "c:helloWorldLwc",
                        { message: "Hello from React!" },
                        containerRef.current,
                        function (cmp, status, errorMessage) {
                            if (status === "SUCCESS") {
                                console.log("LWC Created Successfully!");
                            } else {
                                console.error("CreateComponent Error:", errorMessage);
                                setError("Failed to load LWC: " + errorMessage);
                            }
                        }
                    );
                },
                instanceUrl,
                accessToken
            );
        };

        // If script is already there, just init
        if (window.$Lightning) {
            initLightning();
            return;
        }

        // Dynamically load the script from YOUR instance URL
        const script = document.createElement("script");
        script.src = `${instanceUrl}/lightning/lightning.out.js`;
        script.async = true;
        script.onload = () => {
            setScriptLoaded(true);
            initLightning();
        };
        script.onerror = () => setError("Failed to load Salesforce JS library.");
        document.head.appendChild(script);

    }, [accessToken, instanceUrl]);

    return (
        <div style={ { padding: '20px', border: '1px solid #ddd', marginTop: '20px' } }>
            <h3>Salesforce Lightning Out 2.0</h3>
            { error && <div style={ { color: 'red', fontWeight: 'bold' } }>{ error }</div> }
            <div ref={ containerRef } id="lightning-container" style={ { minHeight: '200px' } }>
                { !error && !window.$Lightning && <p>Loading Salesforce Resources...</p> }
            </div>
        </div>
    );
};

export default LightningContainer;