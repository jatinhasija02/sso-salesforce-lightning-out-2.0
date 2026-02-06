export const loginToSalesforce = () => {
    return new Promise((resolve, reject) => {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';

        iframe.src =
            'https://YOUR_DOMAIN.my.salesforce.com' +
            '?so=YOUR_SSO_ID';

        iframe.onload = () => {
            // Salesforce session cookie is now set
            resolve();
        };

        iframe.onerror = () => {
            reject('Salesforce SSO failed');
        };

        document.body.appendChild(iframe);
    });
};
