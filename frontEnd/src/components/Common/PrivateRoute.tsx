import Spinner from 'components/Common/Spinner';
import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ErrorCodes } from 'utils/errorUtils';
import { Logger } from 'utils/logger';
import { auth } from 'utils/spaUrls';
import { useStytchSession, useStytchUser } from '@stytch/react';
import Header from 'components/Layouts/Header';


export default function PrivateRoute({ outlet } : {outlet: JSX.Element}) {
  const { user } = useStytchUser();
  const { session } = useStytchSession();
  const navigate = useNavigate();

  React.useEffect(() => {
    (async () => {
      try {
        if (!session?.session_id) {
          navigate(auth.login);
        }
      }
      catch (error) {
        if (error instanceof Error) {
          Logger.error(ErrorCodes.auth.stytchGetToken, error.message);
        }
        navigate(auth.login);
      }
    })();
  }, [session, navigate]);

  if (!session) { return <Spinner />; }
  else if (session && user) {
    return (
      <>
        <Header />
        {outlet}
      </>
    );
  }
  else {
    return <Navigate to={auth.login} />;
  }
}
