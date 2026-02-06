export const loadLightningOut = () => {
    return new Promise((resolve, reject) => {
        if (window.$Lightning) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src =
            'https://algocirrus-b6-dev-ed.lightning.force.com/lightning/lightning.out.js';

        script.onload = () => {
            window.$Lightning.use(
                'c:LightningOutApp', // Aura wrapper
                () => {
                    window.$Lightning.createComponent(
                        'c:Your_LWC_Component',
                        {},
                        'lightning-container',
                        () => resolve()
                    );
                },
                'https://algocirrus-b6-dev-ed.my.salesforce.com'
            );
        };

        script.onerror = () => reject('Lightning Out failed');

        document.body.appendChild(script);
    });
};
