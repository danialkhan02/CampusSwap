import AppBar from '@mui/material/AppBar';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import UserSettings from 'components/Layouts/UserSettings';
import { SettingsButton } from 'pages/Authentication/components/SettingsButton';
import Stack from '@mui/material/Stack';
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
            justifyContent='flex-end'
            sx={{ px: 2 }}
          >
            <Grid
              item
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                width: 'auto',
              }}
            >
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
