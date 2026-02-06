import { AUTH_STATE } from '../authStates';

export const logoutFromSalesforce = () => {
    window.location.href =
        'https://YOUR_DOMAIN.my.salesforce.com/secur/logout.jsp';
};

export const logoutFromAuth0 = () => {
    window.location.href =
        `https://YOUR_AUTH0_DOMAIN/v2/logout` +
        `?client_id=YOUR_CLIENT_ID` +
        `&returnTo=${encodeURIComponent(window.location.origin)}`;
};
