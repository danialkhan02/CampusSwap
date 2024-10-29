import type { Theme, SxProps, Breakpoint } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import { LayoutSection } from 'pages/Authentication/components/LayoutSection';
import { HeaderSection } from 'pages/Authentication/components/HeaderSection';
import logo from 'assets/logo.png';
import Grid from '@mui/material/Grid';
import React from 'react';
import { helpEmail } from 'utils/errorUtils';

// ----------------------------------------------------------------------

export type AuthSplitLayoutProps = {
    sx?: SxProps<Theme>;
    children: React.ReactNode;
    header?: {
        sx?: SxProps<Theme>;
    };
};

export function AuthSplitLayout({
  sx, children, header,
}: AuthSplitLayoutProps) {
  const layoutQuery: Breakpoint = 'md';

  return (
    <LayoutSection
      headerSection={(
        <HeaderSection
          disableElevation
          layoutQuery={layoutQuery}
          slotProps={{ container: { maxWidth: false } }}
          sx={{ position: { [layoutQuery]: 'fixed' }, ...header?.sx }}
          slots={{
            topArea: (
              <Alert severity='info' sx={{ display: 'none', borderRadius: 0 }}>
                This is an info Alert.
              </Alert>
            ),
            leftArea: (
              <Grid item xs={4} marginTop='20px'>
                <img height='100px' src={logo} alt='' />
              </Grid>
            ),
            rightArea: (
              <Box display='flex' alignItems='center' gap={{ xs: 1, sm: 1.5 }}>
                <Link
                  href={`mailto:${helpEmail}`}
                  color='inherit'
                  sx={{ typography: 'subtitle2' }}
                >
                  Need help?
                </Link>
              </Box>
            ),
          }}
        />
              )}
      footerSection={null}
      cssVars={{ '--layout-auth-content-width': '420px' }}
      sx={sx}
    >
      {children}
    </LayoutSection>
  );
}
