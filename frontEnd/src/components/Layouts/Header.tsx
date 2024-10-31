import AppBar from '@mui/material/AppBar';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import UserSettings from 'components/Layouts/UserSettings';
import { SettingsButton } from 'pages/Authentication/components/SettingsButton';
import Stack from '@mui/material/Stack';
import { ListItemIcon, ListItemButton, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';
import { Chat } from '@mui/icons-material';


export default function Header() {
  const theme = useTheme();
  return (
    <AppBar sx={{ maxHeight: theme.custom.appBarHeight }}>
      <Toolbar disableGutters>
        <Grid container justifyContent='flex-end'>
          <Grid item xs={4} md={1} sx={{ textAlign: 'center' }}>
            <Stack direction='row' spacing={1}>
              <ListItemButton component={Link} to='/chats'>
                <ListItemIcon>
                  <Chat />
                </ListItemIcon>
                <ListItemText primary='Messages' />
              </ListItemButton>
              <SettingsButton />
              <UserSettings />
            </Stack>
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );
}
