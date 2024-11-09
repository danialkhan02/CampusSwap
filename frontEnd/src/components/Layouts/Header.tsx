import AppBar from '@mui/material/AppBar';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Logo from 'assets/logo.png';
import UserSettings from 'components/Layouts/UserSettings';
import { SettingsButton } from 'pages/Authentication/components/SettingsButton';
import MessageButton from 'pages/Authentication/components/MessageButton';
import Breadcrumbs from 'components/Layouts/Breadcrumbs';


export default function Header() {
  const theme = useTheme();

  return (
    <>
      <AppBar sx={{ maxHeight: theme.custom.appBarHeight }}>
        <Toolbar disableGutters>
          <Grid
            container
            alignItems='center'
            sx={{ px: 2 }}
          >
            {/* Logo Section */}
            <Grid item>
              <Box
                component='img'
                src={Logo}
                alt='Logo'
                sx={{
                  height: 80,
                  width: 'auto',
                  mt: 2,
                }}
              />
            </Grid>

            {/* Spacer */}
            <Grid item xs />

            {/* Actions Section */}
            <Grid item>
              <Stack
                direction='row'
                spacing={1}
                sx={{
                  alignItems: 'center',
                  minHeight: theme.custom.appBarHeight,
                }}
              >
                <MessageButton />
                <SettingsButton />
                <UserSettings />
              </Stack>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
      <Breadcrumbs />
    </>
  );
}
