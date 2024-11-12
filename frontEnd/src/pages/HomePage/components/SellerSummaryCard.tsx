import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Rating,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Spinner from 'components/Common/Spinner';
import {
  IUser, sellerQueryKey, useGetSellerProfile, useGetUser, userQueryKey,
} from 'pages/Authentication/queries';
import { useNavigate } from 'react-router-dom';


type TProps = {
    seller: IUser;
}

function RatingBars() {
  return (
    <Stack spacing={1.5} sx={{ minWidth: 300 }}>
      {[5, 4, 3, 2, 1].map((rating) => (
        <Stack key={rating} direction='row' spacing={2} alignItems='center'>
          <Typography
            variant='body2'
            color='text.secondary'
            sx={{ minWidth: 60 }}
          >
            {rating}
            {' '}
            Star
          </Typography>
          <LinearProgress
            variant='determinate'
            value={rating * 10}
            sx={{
              width: '100%',
              height: 8,
              borderRadius: 4,
              bgcolor: '#e0f2e8',
              '& .MuiLinearProgress-bar': {
                bgcolor: '#43a047',
                borderRadius: 4,
              },
            }}
          />
          <Typography
            variant='body2'
            color='text.secondary'
            sx={{ minWidth: 30 }}
          >
            {rating * 10}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}

export default function SellerSummaryCard({ seller }: TProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const isXlUp = useMediaQuery(theme.breakpoints.up('xl'));
  const isLgUp = useMediaQuery(theme.breakpoints.up('lg'));
  const {
    data: sellerData,
    isLoading,
  } = useGetSellerProfile(seller?.id || '', {
    queryKey: sellerQueryKey(seller?.id || ''),
    enabled: Boolean(seller?.id || ''),
    retry: false,
  });
  const { data: userData } = useGetUser(seller?.id || '', {
    queryKey: userQueryKey(seller?.id || ''),
    enabled: Boolean(seller?.id || ''),
  });
  const widthBreakpoint = () => {
    if (isXlUp) {
      return '60%';
    }
    if (isLgUp) {
      return '40%';
    }

    return '40%';
  };

  if (!sellerData || !sellerData?.data || isLoading) {
    return <Spinner />;
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ maxWidth: '100%', p: 2 }}>
          <Stack
            direction='row'
            spacing={5}
            alignItems='center'
            justifyContent='space-between'
          >
            <Stack
              direction='row'
              spacing={5}
              alignItems='center'
              flex={1}
            >
              {/* Avatar and Button Column */}
              <Stack spacing={2} alignItems='center' sx={{ minWidth: 120 }}>
                <Typography
                  variant='h6'
                  color='text.primary'
                  sx={{ mb: 1 }}
                >
                  Posted By
                </Typography>
                <Avatar
                  src={seller.profile_image_url}
                  alt={seller.first_name}
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: 'grey.100',
                  }}
                />
                <Button
                  variant='contained'
                  fullWidth
                  onClick={() => navigate(`/seller/${seller.id}`)}
                  sx={{
                    bgcolor: 'grey.900',
                    '&:hover': {
                      bgcolor: 'grey.800',
                    },
                    textTransform: 'none',
                    borderRadius: '8px',
                    py: 1,
                    fontSize: '0.875rem',
                  }}
                >
                  Go To Seller Profile
                </Button>
              </Stack>

              {/* Information Column */}
              <Stack spacing={1.5} flex={1}>
                <Typography
                  variant='h3'
                  sx={{
                    fontSize: '2rem',
                    fontWeight: 500,
                    color: 'text.primary',
                    mb: '20px',
                  }}
                >
                  {`${seller.first_name} ${seller.last_name}`}
                </Typography>

                <Stack direction='row' alignItems='center' spacing={1}>
                  <Rating
                    name='half-rating-read'
                    value={sellerData.data.average_rating}
                    max={5}
                    precision={0.5}
                    readOnly
                  />
                  <Typography
                    variant='body1'
                    color='text.secondary'
                    sx={{ fontSize: '1rem' }}
                  >
                    (
                    {sellerData?.data.total_reviews || 0}
                    )
                  </Typography>
                </Stack>

                <Typography
                  variant='body1'
                  sx={{
                    fontSize: '1rem',
                    color: 'text.primary',
                  }}
                >
                  Phone Number:
                  {' '}
                  {userData?.data.phone_number || ''}
                </Typography>

                <Typography
                  variant='body1'
                  sx={{
                    fontSize: '1rem',
                    color: 'text.primary',
                  }}
                >
                  Total Listings:
                  {' '}
                  {sellerData.data.num_listings}
                </Typography>

                <Typography
                  variant='body1'
                  sx={{
                    fontSize: '1rem',
                    color: 'text.primary',
                  }}
                >
                  {userData?.data.description || ''}
                </Typography>
              </Stack>
            </Stack>

            {/* Rating Bars - Only show on lg and up */}
            {isLgUp && (
            <Box width={widthBreakpoint()} sx={{ pl: 4, borderLeft: 1, borderColor: 'divider' }}>
              <RatingBars />
            </Box>
            )}
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
