import React from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import { IUser } from 'pages/Authentication/queries';
import { CardContent, CardHeader } from '@mui/material';
import Stack from '@mui/material/Stack';
import MailIcon from '@mui/icons-material/Mail';
import WorkIcon from '@mui/icons-material/Work';
import ProfileBanner from 'pages/UserProfile/components/ProfileBanner';


type TProps = {
    userInfo: IUser;
};

export default function UserPreview({
  userInfo,
}: TProps) {
  return (
    <Grid container spacing={4} mt='20px'>
      <ProfileBanner user={userInfo} />
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title={<Typography variant='h6'>About</Typography>}
          />
          <CardContent>
            <Stack direction='column' spacing={2}>
              <Typography variant='body2'>{userInfo?.description || ''}</Typography>
              <Stack direction='row' spacing={1}>
                <MailIcon />
                <Typography variant='body2'>{userInfo.email}</Typography>
              </Stack>
              <Stack direction='row' spacing={1}>
                <WorkIcon />
                <Typography variant='body2'>{userInfo?.phone_number || 'No phone number provided'}</Typography>
              </Stack>
              <Stack direction='row' spacing={1}>
                <MailIcon />
                <Typography variant='body2'>{userInfo?.location || 'No address provided'}</Typography>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
