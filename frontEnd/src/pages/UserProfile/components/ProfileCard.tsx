import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { ISellerProfile, IUser } from 'pages/Authentication/queries';
import Card from '@mui/material/Card';
import {
  CardContent, CardHeader, LinearProgress, Rating,
} from '@mui/material';
import Stack from '@mui/material/Stack';
import MailIcon from '@mui/icons-material/Mail';
import WorkIcon from '@mui/icons-material/Work';
import Button from '@mui/material/Button';
import EditIcon from '@mui/icons-material/Edit';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { useState } from 'react';
import UpdateProfileModal from 'pages/UserProfile/components/UpdateProfileModal';
import { TApiResponse } from 'utils/apiResponse.type';


type TProps = {
  profile: IUser,
  sellerView?: boolean,
  sellerData?: TApiResponse<ISellerProfile>,
}

export default function ProfileCard({ profile, sellerView, sellerData }: TProps) {
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const handleClick = () => {
    setModalOpen(true);
  };

  const totalReviews = Object.values(
    sellerData?.data.ratings_count || {},
  ).reduce((acc, count) => acc + (count || 0), 0);

  return (
    <Grid item xs={12}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title={<Typography variant='h6'>About</Typography>}
            action={(
                !sellerView
              && <Button variant='contained' startIcon={<EditIcon />} onClick={handleClick}>Edit Profile</Button>
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
      {sellerData && (
        <Grid item xs={12}>
          <Card sx={{ marginTop: 2 }}>
            <CardContent>
              <Stack direction='row' justifyContent='space-between' alignItems='center' spacing={2}>
                <Stack spacing={1} alignItems='center'>
                  <Typography variant='body2' color='text.secondary'>
                    Average rating
                  </Typography>
                  <Stack direction='row' alignItems='baseline' spacing={1}>
                    <Typography variant='h3' fontWeight='500'>
                      {sellerData.data.average_rating}
                    </Typography>
                    <Typography variant='h4' color='text.secondary'>
                      /5
                    </Typography>
                  </Stack>
                  <Stack spacing={1} alignItems='center'>
                    <Rating
                      value={sellerData.data.average_rating}
                      readOnly
                    />
                    <Typography variant='body2' color='text.secondary'>
                      {`(${totalReviews} ${totalReviews > 1 ? 'Reviews' : 'Review'})`}
                    </Typography>
                  </Stack>
                </Stack>
                <Divider orientation='vertical' flexItem />
                <Box width='60%'>
                  {[5, 4, 3, 2, 1].map((star) => (
                    <Stack key={star} direction='row' spacing={2} alignItems='center'>
                      <Typography variant='body2' color='text.secondary' sx={{ minWidth: 45 }}>
                        {star}
                        {' '}
                        Star
                      </Typography>
                      <LinearProgress
                        variant='determinate'
                        value={totalReviews > 0 ? ((sellerData.data.ratings_count[
                            star as keyof typeof sellerData.data.ratings_count] || 0)
                            / totalReviews) * 100 : 0}
                        sx={{
                          flex: 1,
                          height: 8,
                          borderRadius: 4,
                          bgcolor: '#eee',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: '#000',
                            borderRadius: 4,
                          },
                        }}
                      />
                      <Typography variant='body2' color='text.secondary' sx={{ minWidth: 25 }}>
                        {sellerData.data.ratings_count[
                            star as keyof typeof sellerData.data.ratings_count] || 0}
                      </Typography>
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
