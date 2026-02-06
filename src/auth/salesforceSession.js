export const verifySalesforceSession = async () => {
    const response = await fetch(
        'https://algocirrus-b6-dev-ed.develop.my.salesforce.com/services/data/v59.0/',
        {
            credentials: 'include'
        }
    );

    if (!response.ok) {
        throw new Error('Salesforce session expired');
    }
};
