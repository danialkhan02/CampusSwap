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

  const [isFullNav, setIsFullNav] = React.useState<boolean>(true);
  const drawerWidth = isFullNav ? theme.custom.sidebarWidth : theme.custom.smSidebarWidth;

  const sideNavCtxValue = React.useMemo(
    () => ({
      drawerWidth, isFullNav, setIsFullNav, setMobileOpen, mobileOpen,
    }),
    [drawerWidth, isFullNav, mobileOpen, setMobileOpen],
  );
  if (!session || !user) {
    return <Box>{children}</Box>;
  }

  return (
    <SideNavCtx.Provider value={sideNavCtxValue}>
      <Box component='nav' mx='10px' mt={`calc(${theme.custom.appBarHeight} + 15px)`}>
        <SideNav />
        <Box
          component='main'
          ml={`calc(${drawerWidth} + 45px)`}
          mr='45px'
          pb='24px'
        >
          {children}
        </Box>
      </Box>
    </SideNavCtx.Provider>
  );
}
