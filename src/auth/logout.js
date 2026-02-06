const handleLogout = () => {
    window.location.href =
        'https://algocirrus-b6-dev-ed.develop.my.salesforce.com/secur/logout.jsp';

    setTimeout(() => {
        window.location.href =
            'https://dev-sf4mdxnyt4bvy3np.us.auth0.com/v2/logout' +
            '?client_id=pkJRoRqgVGgxE1E5pbNfRGibCdoIQ2jC' +
            '&returnTo=http%3A%2F%2Flocalhost%3A3000';
    }, 500);
};
