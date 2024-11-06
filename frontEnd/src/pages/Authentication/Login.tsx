import { useStytch, useStytchSession } from '@stytch/react';
import { auth, homepage } from 'utils/spaUrls';
import {
  Button, Grid, Typography,
} from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import image from 'assets/illustration-receipt.webp';
import logo from 'assets/logo.png';
import { Microsoft } from '@mui/icons-material';
import Stack from '@mui/material/Stack';


export default function Login() {
  const stytchClient = useStytch();
  const { session } = useStytchSession();
  const navigate = useNavigate();
  const REDIRECT_URL = `${window.location.origin}${auth.landingPad}`;

  React.useEffect(() => {
    if (session) {
      navigate(homepage);
    }
    else {
      localStorage.clear();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startMicrosoftOAuth = () => stytchClient.oauth.microsoft.start({
    login_redirect_url: REDIRECT_URL,
    signup_redirect_url: REDIRECT_URL,
    custom_scopes: ['User.Read'],
  });

  return (
    <Grid container style={{ height: '100vh' }}>
      <Grid
        item
        xs={12}
        md={6}
        style={{
          backgroundColor: '#f4f6f8', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Box textAlign='center'>
          <img src={image} alt='Workflow illustration' style={{ width: '80%', marginBottom: 20 }} />
          <Typography variant='h4' fontWeight='bold'>Hi, Welcome to Campus Swap</Typography>
          <Typography variant='body1'>Buy second hand items more efficiently.</Typography>
        </Box>
      </Grid>

      <Grid item xs={12} md={6} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box width='80%' maxWidth={400} textAlign='center'>
          <Grid container alignItems='center' spacing={1} sx={{ mb: 4 }}>
            <Grid item xs={12}>
              <Stack direction='row' alignItems='center' spacing={2}>
                <img src={logo} alt='Logo' style={{ maxHeight: '150px', marginTop: '20px' }} />
                <Typography variant='h3' color='text.primary' marginLeft='-40px'>Campus Swap</Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} style={{ marginTop: '-30px' }}>
              <Typography variant='h5'>Login or Sign Up</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant='subtitle2' color='text.secondary'>Welcome! Please login using your UofT Email</Typography>
            </Grid>
          </Grid>
          <Button
            size='large'
            variant='contained'
            startIcon={<Microsoft />}
            onClick={startMicrosoftOAuth}
            fullWidth
          >
            Sign in with Microsoft
          </Button>
          <Box display='flex' justifyContent='center' />
        </Box>
      </Grid>
    </Grid>
  );
}
