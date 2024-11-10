import {
  Avatar, Button, Grid, LinearProgress, Rating, Stack, Typography,
} from '@mui/material';
import { useState } from 'react';
import { IReview, useGetSellerReviews } from 'pages/SellerProfile/queries';
import { TApiResponse } from 'utils/apiResponse.type';
import userImage from 'assets/avatar-25.webp';
import Box from '@mui/material/Box';
import { Edit } from '@mui/icons-material';


type Props = {
  sellerId: string;
  ratingDistribution: Record<number, number>;
};

export default function UserReviews({
  ratingDistribution,
  sellerId,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const { data: sellerReviewsData, isLoading } = useGetSellerReviews(sellerId);
  const handleLeaveReview = () => {
    setModalOpen(true);
  };

  const sellerReviewsDatas: TApiResponse<IReview[]> = {
    data: [
      {
        id: '1',
        userName: 'John Doe',
        rating: 3,
        comment: 'He is a great guy! He is very adjusting.',
        date: '2024/01/01',
        avatarUrl: userImage,
      },
      {
        id: '2',
        userName: 'John Doe',
        rating: 3,
        comment: 'He is a great guy! He is very adjusting.',
        date: '2024/01/01',
        avatarUrl: userImage,
      },
      {
        id: '3',
        userName: 'John Doe',
        rating: 3,
        comment: 'He is a great guy! He is very adjusting.',
        date: '2024/01/01',
        avatarUrl: userImage,
      },
      {
        id: '4',
        userName: 'John Doe',
        rating: 3,
        comment: 'He is a great guy! He is very adjusting.',
        date: '2024/01/01',
        avatarUrl: userImage,
      },
    ],
    error: null,
  };

  return (
    <Grid item xs={12}>
      <Stack spacing={6}>
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            minHeight: 100,
            pb: 3,
          }}
        >
          {/* Content Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 2fr 1fr',
              position: 'relative',
              '&::before, &::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                bottom: 24,
                width: 0,
                borderLeft: '2px dotted',
                borderColor: 'divider',
              },
              '&::before': {
                left: 'calc(25% + 16px)', // Adjust based on gap
              },
              '&::after': {
                right: 'calc(25% + 16px)', // Adjust based on gap
              },
              gap: 4,
              height: '150%',
            }}
          >
            {/* Left Section - Average Rating */}
            <Stack spacing={1} alignItems='center'>
              <Typography variant='body2' color='text.secondary'>
                Average rating
              </Typography>
              <Stack direction='row' alignItems='baseline' spacing={1}>
                <Typography variant='h3' fontWeight='500'>
                  3.5
                </Typography>
                <Typography variant='h4' color='text.secondary'>
                  /5
                </Typography>
              </Stack>
              <Stack spacing={1} alignItems='center'>
                <Rating
                  value={3.5}
                  readOnly
                  precision={0.5}
                  name='half-rating-read'
                  sx={{
                    '& .MuiRating-icon': {
                      color: '#FFB800',
                    },
                  }}
                />
                <Typography variant='body2' color='text.secondary'>
                  (11.84K Reviews)
                </Typography>
              </Stack>
            </Stack>

            {/* Middle Section - Rating Distribution */}
            <Stack spacing={1.5} sx={{ px: 4 }}>
              {[5, 4, 3, 2, 1].map((star) => (
                <Stack key={star} direction='row' spacing={2} alignItems='center'>
                  <Typography variant='body2' color='text.secondary' sx={{ minWidth: 45 }}>
                    {star}
                    {' '}
                    Star
                  </Typography>
                  <LinearProgress
                    variant='determinate'
                    value={(ratingDistribution[star] || 0) / sellerReviewsDatas.data.length * 100}
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
                    {ratingDistribution[star] || 0}
                  </Typography>
                </Stack>
              ))}
            </Stack>

            {/* Right Section - Leave Review Button */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                pt: 2,
              }}
            >
              <Button
                variant='text'
                startIcon={<Edit sx={{ fontSize: '18px' }} />}
                onClick={handleLeaveReview}
                sx={{
                  color: 'text.primary',
                  bgcolor: 'grey.50',
                  px: 3,
                  py: 1,
                  whiteSpace: 'nowrap',
                  '&:hover': {
                    bgcolor: 'grey.100',
                  },
                }}
              >
                Leave a review
              </Button>
            </Box>
          </Box>

          {/* Bottom Border */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              borderBottom: '2px dotted',
              borderColor: 'divider',
            }}
          />
        </Box>

        {/* Reviews List Section */}
        <Stack spacing={3}>
          {sellerReviewsDatas.data.map((review) => (
            <Stack key={review.id} direction='row' spacing={2}>
              <Avatar
                src={review.avatarUrl}
                alt={review.userName}
                sx={{ width: 48, height: 48 }}
              />
              <Stack spacing={1}>
                <Stack spacing={0.5}>
                  <Typography variant='subtitle1'>
                    {review.userName}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {review.date}
                  </Typography>
                </Stack>
                <Rating
                  value={review.rating}
                  readOnly
                  size='small'
                  sx={{
                    '& .MuiRating-icon': {
                      color: '#FFB800',
                    },
                  }}
                />
                <Typography variant='body2'>
                  {review.comment}
                </Typography>
              </Stack>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Grid>
  );
}
