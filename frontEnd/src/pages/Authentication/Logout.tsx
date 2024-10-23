import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from 'utils/spaUrls';
import Spinner from 'components/Common/Spinner';
import { Logger } from 'utils/logger';
import { ErrorCodes } from 'utils/errorUtils';
import { useStytch } from '@stytch/react';


export default function Logout() {
  const stytchClient = useStytch();
  const navigate = useNavigate();
  const hasLoggedOut = React.useRef(false);

  React.useEffect(() => {
    if (!hasLoggedOut.current) {
      localStorage.clear();
      stytchClient.session.revoke()
        .then((resp) => resp.status_code === 200 && navigate(auth.login))
        .catch((err) => {
          if (err instanceof Error) {
            Logger.error(ErrorCodes.auth.stytchGetToken, err.message);
            navigate(auth.login);
          }
        });
      hasLoggedOut.current = true;
    }
  }, [navigate, stytchClient.session]);

  return <Spinner />;
}
