import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import React from 'react';
import { useStytchSession, useStytchUser } from '@stytch/react';


export default function Borders({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const { session } = useStytchSession();
  const { user } = useStytchUser();

  if (!session || !user) {
    return <Box>{children}</Box>;
  }

  return (
    <Box component='nav' mx='10px' mt={`calc(${theme.custom.appBarHeight} + 15px)`}>
      <Box
        component='main'
        ml='45px'
        mr='45px'
        pb='24px'
      >
        {children}
      </Box>
    </Box>
  );
}
