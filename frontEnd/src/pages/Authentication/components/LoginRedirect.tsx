import Spinner from 'components/Common/Spinner';
import React from 'react';
import { identifyUser } from 'instrumentation/analytics';
import { retrieve } from 'utils/cacheUtils';
import { CacheKeys } from 'utils/constants';
import { homepage } from 'utils/spaUrls';
import { OAuthAuthenticateResponse } from '@stytch/vanilla-js';
import { useNavigate } from 'react-router-dom';


type TProps = {
    stytchResponse: OAuthAuthenticateResponse;
}

export default function LoginRedirect({ stytchResponse }: TProps) {
  const navigate = useNavigate();
  React.useEffect(() => {
    if (!stytchResponse || !stytchResponse.user || !stytchResponse.user_id) { return; }
    const trustedMetadata = stytchResponse.user.trusted_metadata;
    const userCodeiId = trustedMetadata?.codei_id as string;
    identifyUser({
      userId: userCodeiId,
      email: retrieve(CacheKeys.email, {}),
      name: retrieve(CacheKeys.userResponse, { setToIfNull: true }).displayName,
    });
    navigate(homepage, { replace: true });
  }, [navigate, stytchResponse]);

  return (
    <Spinner />
  );
}
