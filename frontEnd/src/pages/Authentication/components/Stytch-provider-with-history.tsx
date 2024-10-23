import { ReactNode } from 'react';
import { StytchUIClient } from '@stytch/vanilla-js';
import { StytchProvider } from '@stytch/react';


export default function StytchProviderWithHistory({ children }: {children: ReactNode}) {
  const publicToken = process.env.REACT_APP_STYTCH_PUBLIC_TOKEN ?? (() => {
    throw new Error('REACT_APP_STYTCH_PUBLIC_TOKEN is not defined');
  })();

  const stytchClient = new StytchUIClient(publicToken);

  return (
    <StytchProvider stytch={stytchClient}>
      {children}
    </StytchProvider>
  );
}
