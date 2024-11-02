import React, { useEffect, useRef } from 'react';
import Spinner from 'components/Common/Spinner';
import { useNavigate } from 'react-router-dom';
import { auth, homepage } from 'utils/spaUrls';
import { Logger } from 'utils/logger';
import { OauthAuthenticationType, useCreateUser } from 'pages/Authentication/queries';
import { save } from 'utils/cacheUtils';
import { CacheKeys } from 'utils/constants';
import { identifyUser } from 'instrumentation/analytics';
import { OAuthAuthenticateResponse } from '@stytch/vanilla-js';


const ALLOWED_DOMAINS = ['mail.utoronto.ca', 'utoronto.ca'];

type TProps = {
    stytchResponse: OAuthAuthenticateResponse;
};

export default function SignUp({ stytchResponse }: TProps) {
  const navigate = useNavigate();
  const createUserHook = useCreateUser();
  const hasCreatedUserRef = useRef(false); // Track if user creation has been attempted

  useEffect(() => {
    const createUser = async () => {
      if (!stytchResponse || !stytchResponse.user || !stytchResponse.user_id) {
        Logger.error('Invalid stytchResponse');
        navigate(auth.logout, { replace: true });
        return;
      }

      if (hasCreatedUserRef.current) {
        return;
      }

      hasCreatedUserRef.current = true;

      try {
        const graphResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${stytchResponse.provider_values.access_token}`,
          },
        });

        const userData = await graphResponse.json();
        if (!graphResponse.ok) {
          throw new Error(`Graph API error: ${userData.error.message}`);
        }

        const email = userData?.mail || '';
        const domain = email.split('@')[1]?.toLowerCase();
        if (!domain || !ALLOWED_DOMAINS.includes(domain)) {
          Logger.error('Non-UofT email attempted signup');
          navigate(auth.logout, { replace: true });
          return;
        }

        save(CacheKeys.userResponse, JSON.stringify(userData));
        save(CacheKeys.email, userData?.mail || '');
        const data = await createUserHook.mutateAsync({
          email: userData?.mail || '',
          provider: OauthAuthenticationType.OAUTH_AUTHENTICATION_TYPE_MICROSOFT,
          first_name: userData?.givenName || '',
          last_name: userData?.surname || '',
          stytch_id: stytchResponse.user_id,
          oauth_id: stytchResponse.user.providers[0].oauth_user_registration_id,
        });

        save(CacheKeys.userId, data.data.id || '');
        identifyUser({
          userId: data.data.id || '',
          email: userData?.mail || '',
          name: userData?.diplayName || '',
        });
        navigate(homepage, { replace: true });
      }
      catch (error) {
        Logger.error('Failed to create a user', error);
        navigate(auth.logout, { replace: true });
      }
    };

    createUser();
  }, [stytchResponse, navigate, createUserHook]);

  return <Spinner />;
}
