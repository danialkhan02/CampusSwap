import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import {
  IUser, useGetSellerProfile, userQueryKey,
} from 'pages/Authentication/queries';
import Card from '@mui/material/Card';
import { CardContent, CardHeader, LinearProgress } from '@mui/material';
import Stack from '@mui/material/Stack';
import MailIcon from '@mui/icons-material/Mail';
import WorkIcon from '@mui/icons-material/Work';
import Button from '@mui/material/Button';
import EditIcon from '@mui/icons-material/Edit';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import StarIcon from '@mui/icons-material/Star';
import { useState } from 'react';
import UpdateProfileModal from 'pages/UserProfile/components/UpdateProfileModal';


type TProps = {
    profile: IUser,
}

export default function ProfileCard({ profile }: TProps) {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const {
    data: sellersData,
    isLoading,
  } = useGetSellerProfile(profile?.id || '', {
    queryKey: userQueryKey(profile?.id || ''),
    enabled: Boolean(profile.id),
    retry: false,
  });

  const sellerData = {
    data: {
      id: '1',
      seller_id: '2',
      total_transactions: 60,
      average_rating: 4.5,
    },
  };

  const handleClick = () => {
    setModalOpen(true);
  };

  return (
    <Grid item xs={12}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title={<Typography variant='h6'>About</Typography>}
            action={(
              <Button variant='contained' startIcon={<EditIcon />} onClick={handleClick}>Edit Profile</Button>
              )}
          />
          <CardContent>
            <Stack direction='column' spacing={2}>
              <Typography variant='body2'>{profile?.description || ''}</Typography>
              <Stack direction='row' spacing={1}>
                <MailIcon />
                <Typography variant='body2'>{profile.email}</Typography>
              </Stack>
              <Stack direction='row' spacing={1}>
                <WorkIcon />
                <Typography variant='body2'>{profile?.phone_number || 'No phone number provided'}</Typography>
              </Stack>
              <Stack direction='row' spacing={1}>
                <MailIcon />
                <Typography variant='body2'>{profile?.location || 'No address provided'}</Typography>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
      {sellerData?.data && (
        <Grid item xs={12}>
          <Card sx={{ marginTop: 2 }}>
            <CardContent>
              <Stack direction='row' justifyContent='space-between' alignItems='center' spacing={2}>
                <Box>
                  <Typography variant='subtitle1'>Average rating:</Typography>
                  <Typography variant='h4'>4/5</Typography>
                  <Stack direction='row' alignItems='center' spacing={0.5}>
                    {[...Array(4)].map((_, index) => (
                      <StarIcon key='1' sx={{ color: '#FFD700' }} />
                    ))}
                    <StarIcon sx={{ color: '#C0C0C0' }} />
                    {' '}
                    {/* Gray star for 4/5 */}
                  </Stack>
                  <Typography variant='caption'>(54 Reviews)</Typography>
                </Box>
                <Divider orientation='vertical' flexItem />
                <Box width='60%'>
                  {[5, 4, 3, 2, 1].map((star) => (
                    <Stack direction='row' alignItems='center' spacing={1} key={star}>
                      <Typography variant='body2'>
                        {star}
                        {' '}
                        Star
                      </Typography>
                      <LinearProgress
                        variant='determinate'
                        value={(star * 10)} // Example percentage, replace with real data
                        sx={{
                          flex: 1, marginX: 1, height: 8, borderRadius: 4,
                        }}
                      />
                      <Typography variant='body2'>{star * 10}</Typography>
                      {' '}
                      {/* Example count */}
                    </Stack>
                  ))}
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      )}
      {modalOpen && (
      <UpdateProfileModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        currentUser={profile}
      />
      )}
    </Grid>
  );
}
