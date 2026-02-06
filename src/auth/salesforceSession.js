export const verifySalesforceSession = async () => {
    const response = await fetch(
        'https://YOUR_DOMAIN.my.salesforce.com/services/data/v59.0/',
        {
            credentials: 'include'
        }
    );

    if (!response.ok) {
        throw new Error('Salesforce session expired');
    }
};
