import React, { useEffect, useRef, useState } from 'react';

const LightningContainer = ({ accessToken, instanceUrl }) => {
    const [error, setError] = useState(null);
    const containerRef = useRef(null);

    useEffect(() => {
        if (!window.$Lightning) {
            setError("Salesforce script not loaded in index.html");
            return;
        }

        console.log("⚡ initializing Lightning Out...");

        window.$Lightning.use(
            "c:SsoLOApp", // Your Aura App Name
            function () {
                window.$Lightning.createComponent(
                    "c:yourLwcComponent", // Your LWC Name
                    {},
                    containerRef.current,
                    function (cmp) {
                        console.log("✅ LWC Created!");
                    }
                );
            },
            instanceUrl,
            accessToken
        );
    }, [accessToken, instanceUrl]);

    return (
        <div style={ { padding: '20px', border: '1px solid #ddd', marginTop: '20px' } }>
            <h3>Salesforce LWC</h3>
            { error && <div style={ { color: 'red' } }>{ error }</div> }
            <div ref={ containerRef }></div>
        </div>
    );
};

export default LightningContainer;