import { useStytch, useStytchSession } from '@stytch/react';
import { auth, homepage } from 'utils/spaUrls';
import {
  Button, Card, CardContent, Grid, Stack, Typography,
} from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Microsoft } from '@mui/icons-material';


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
    <Grid container sx={{ height: '100vh', p: 2 }}>
      <Grid item xs={12} lg={5} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Card
          elevation={0}
          sx={{
            width: '100%', maxWidth: 600, p: 4, backgroundColor: '#ffffff',
          }}
        >
          <CardContent sx={{ display: 'flex', flexDirection: 'column' }}>
            <Grid container alignItems='center' spacing={1} sx={{ mb: 4 }}>
              <Grid item xs={12}>
                <Stack direction='row' alignItems='center' spacing={2}>
                  <Typography variant='h1' color='primary'>Swap Squad</Typography>
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Typography variant='h5'>Login or Sign Up</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant='subtitle2' color='text.secondary'>Welcome! Please choose one of the login options</Typography>
              </Grid>
            </Grid>
            <Button
              color='secondary'
              size='large'
              variant='outlined'
              startIcon={<Microsoft />}
              onClick={startMicrosoftOAuth}
              fullWidth
              sx={{ mb: 2 }}
            >
              Continue with Microsoft
            </Button>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
