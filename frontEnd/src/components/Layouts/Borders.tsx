import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import React from 'react';
import { useStytchSession, useStytchUser } from '@stytch/react';
import SideNav from 'components/Layouts/SideNav';


interface ISideNavCtx {
  drawerWidth: string;
  isFullNav: boolean;
  setIsFullNav: React.Dispatch<React.SetStateAction<boolean>>;
  isMobile: boolean;
  mobileOpen: boolean;
  setMobileOpen?: React.Dispatch<React.SetStateAction<boolean>>
}

export const SideNavCtx = React.createContext<Partial<ISideNavCtx>>({});

export default function Borders({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const { session } = useStytchSession();
  const { user } = useStytchUser();
  const [mobileOpen, setMobileOpen] = React.useState<boolean>(false);

  const sideNavCtxValue = React.useMemo(
    () => ({
      setMobileOpen, mobileOpen,
    }),
    [mobileOpen, setMobileOpen],
  );
  if (!session || !user) {
    return <Box>{children}</Box>;
  }

  return (
    <SideNavCtx.Provider value={sideNavCtxValue}>
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
    </SideNavCtx.Provider>
  );
}
