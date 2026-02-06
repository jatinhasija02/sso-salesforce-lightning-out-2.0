export const loginToSalesforce = () => {
    return new Promise((resolve, reject) => {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';

        iframe.src =
            'https://algocirrus-b6-dev-ed.develop.my.salesforce.com?so=Okta_SSO';

        iframe.onload = () => resolve();
        iframe.onerror = () => reject('Salesforce SSO failed');

        document.body.appendChild(iframe);
    });
};
