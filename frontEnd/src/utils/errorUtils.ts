export const helpEmail = 'payas.hasteer@mail.utoronto.ca';

export const fallbackMessage = `Something went wrong. Please contact us at ${helpEmail} for assistance.`;

export const ErrorCodes = {
  auth: {
    stytchClientMisc: 'AUTH-STYTCH-ALL: Stytch Client Error',
    stytchGetToken: 'AUTH-STYTCH-GET-TOKEN: Error getting access token silently',
    stytchMalformedToken: 'AUTH-STYTCH-MALFORMED-TOKEN: Malformed token',
    stytchRevokeSession: 'AUTH-STYTCH: Error revoking session',
  },
  common: {
    uncaughtExpection: 'COM-ALL-EXP: Uncaught Exception',
  },
};
