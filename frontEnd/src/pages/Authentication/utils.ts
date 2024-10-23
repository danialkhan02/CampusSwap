import { save } from 'utils/cacheUtils';
import { CacheKeys } from 'utils/constants';
import { OAuthAuthenticateResponse } from '@stytch/vanilla-js';


export const techDebt = 'Malformed Stytch Response';

export function housekeepingOnAuth(
  response: OAuthAuthenticateResponse,
) {
  if (response.status_code !== 200) {
    throw new Error(techDebt);
  }
  else if (!response.session || !response.user || !response.session_jwt) {
    throw new Error(techDebt);
  }

  save(CacheKeys.response, JSON.stringify(response));
  save(CacheKeys.sessionId, response.session.session_id);
  save(CacheKeys.token, response.session_jwt);
  save(CacheKeys.sessionToken, response.session_token);
}
