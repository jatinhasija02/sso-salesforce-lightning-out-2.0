import React, { useEffect, useRef, useState } from 'react';

const LightningContainer = ({ accessToken, instanceUrl }) => {
    const [error, setError] = useState(null);
    const containerRef = useRef(null);

    useEffect(() => {
        if (!window.$Lightning) {
            setError("Salesforce script not loaded in index.html");
            return;
        }

        console.log("initializing Lightning Out 2.0...");
        console.log('-> Target App: c:LightningOutApp');
        console.log('-> Target Component: c:helloWorldLwc');

        // 1. Initialize your specific Lightning Out App
        window.$Lightning.use(
            "c:LightningOutApp",
            function () {
                // 2. Create your Hello World LWC
                window.$Lightning.createComponent(
                    "c:helloWorldLwc",
                    {
                        // Optional: Pass data to your LWC @api properties here
                        message: "Hello from React!"
                    },
                    containerRef.current,
                    function (cmp, status, errorMessage) {
                        if (status === "SUCCESS") {
                            console.log("helloWorldLwc Created Successfully!");
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
    }, [accessToken, instanceUrl]);

    return (
        <div style={ { padding: '20px', border: '1px solid #ddd', marginTop: '20px' } }>
            <h3>Salesforce Lightning Out 2.0</h3>
            { error && <div style={ { color: 'red', fontWeight: 'bold' } }>{ error }</div> }

            {/* The helloWorldLwc will render inside this div */ }
            <div ref={ containerRef } id="lightning-container" style={ { minHeight: '200px' } }></div>
        </div>
    );
};

export default LightningContainer;