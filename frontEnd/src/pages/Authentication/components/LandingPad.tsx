import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStytch } from '@stytch/react';
import { Logger } from 'utils/logger';
import { ErrorCodes } from 'utils/errorUtils';
import authentication from 'pages/Authentication/constants';
import { housekeepingOnAuth } from 'pages/Authentication/utils';
import { retrieve } from 'utils/cacheUtils';
import { CacheKeys } from 'utils/constants';
import SignUp from 'pages/Authentication/components/SignUp';
import LoginRedirect from 'pages/Authentication/components/LoginRedirect';
import { auth } from 'utils/spaUrls';


const ALLOWED_DOMAINS = ['mail.utoronto.ca', 'utoronto.ca'];


export default function LandingPad() {
  const stytch = useStytch();
  const navigate = useNavigate();
  const hasAuthenticatedRef = useRef(false); // Track if authentication has been attempted

  // Extract URL parameters
  const params = new URLSearchParams(window.location.search);
  const tokenType = params.get(authentication.StytchTokenType);
  const sessionToken = params.get(authentication.StytchToken);
  const email = params.get('email'); // Add this line to get email from URL

  // Retrieve cached response (if exists)
  const stytchResponse = retrieve(CacheKeys.response, { parseJson: true });

  useEffect(() => {
    const authenticateStytchUser = async () => {
      if (!sessionToken || stytchResponse || tokenType !== authentication.Oauth) return;

      if (hasAuthenticatedRef.current) {
        return;
      }

      // Add email check here
      if (email) {
        const domain = email.split('@')[1]?.toLowerCase();
        if (!domain || !ALLOWED_DOMAINS.includes(domain)) {
          Logger.error('Non-UofT email attempted login');
          navigate(auth.logout, { replace: true });
          return;
        }
      }

      hasAuthenticatedRef.current = true; // Prevent multiple authentication attempts

      try {
        // Authenticate the user with Stytch using the OAuth session token
        const response = await stytch.oauth.authenticate(sessionToken, {
          session_duration_minutes: authentication.SessionDurationMinutes,
        });
        housekeepingOnAuth(response);
      }
      catch (error) {
        // Log error and navigate to logout page in case of failure
        if (error instanceof Error) {
          Logger.error(ErrorCodes.auth.stytchGetToken, error.message);
        }
        else {
          Logger.error(ErrorCodes.auth.stytchClientMisc, error);
        }
        navigate(auth.logout, { replace: true });
      }
    };

    authenticateStytchUser();

    // Dependency array ensures the effect is run only when the necessary parameters change
  }, [sessionToken, tokenType, stytchResponse, navigate, stytch, email]);

  // Extract metadata from stytchResponse (if available)
  const trustedMetadata = stytchResponse?.user?.trusted_metadata;
  const userCodeiId = trustedMetadata?.codei_id as string;

  // Conditional rendering: If no userCodeiId is available, show SignUp form
  if (!userCodeiId && trustedMetadata) {
    return <SignUp stytchResponse={stytchResponse} />;
  }

  // Otherwise, redirect to login
  return <LoginRedirect stytchResponse={stytchResponse} />;
}
