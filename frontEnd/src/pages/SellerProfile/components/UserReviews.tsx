import {
  Avatar, Button, Card, CardContent, Grid, Rating, Stack, Typography,
} from '@mui/material';
import { useState } from 'react';
import { IReview, useGetSellerReviews } from 'pages/SellerProfile/queries';
import Box from '@mui/material/Box';
import { Edit, ThumbUp } from '@mui/icons-material';
import CreateFeedbackModal from 'pages/SellerProfile/components/CreateFeedbackModal';
import Spinner from 'components/Common/Spinner';
import userImage from 'assets/avatar-25.webp';
import RatingLines from 'pages/SellerProfile/components/RatingLines';


type Props = {
  sellerId: string;
};

export default function UserReviews({
  sellerId,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const { data: sellerReviewsData, isLoading } = useGetSellerReviews(sellerId);
  const handleLeaveReview = () => {
    setModalOpen(true);
  };

  const calculateAverageRating = (reviews: IReview[]) => {
    if (!reviews || reviews.length === 0) return 0;

    const sum = reviews.reduce((acc, review) => {
      // Handle null/undefined ratings
      const rating = review.rating || 0;
      return acc + rating;
    }, 0);

    const average = sum / reviews.length;
    return Number(average.toFixed(1)); // Rounds to 1 decimal place
  };

  if (!sellerReviewsData || !sellerReviewsData.data || isLoading) {
    return <Spinner />;
  }

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
                  {calculateAverageRating(sellerReviewsData.data)}
                </Typography>
                <Typography variant='h4' color='text.secondary'>
                  /5
                </Typography>
              </Stack>
              <Stack spacing={1} alignItems='center'>
                <Rating
                  value={calculateAverageRating(sellerReviewsData.data)}
                  readOnly
                />
                <Typography variant='body2' color='text.secondary'>
                  {`(${sellerReviewsData.data.length} ${sellerReviewsData.data.length > 1 ? 'Reviews' : 'Review'})`}
                </Typography>
              </Stack>
            </Stack>

            {/* Middle Section - Rating Distribution */}
            <RatingLines reviews={sellerReviewsData.data} />
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
        <Grid container spacing={3}>
          {sellerReviewsData.data.map((review) => (
            <Grid item xs={12} md={6} lg={4} xl={3} key={review.id}>
              <Card
                elevation={1}
                sx={{
                  height: '100%',
                  transition: 'box-shadow 0.3s',
                  '&:hover': {
                    boxShadow: 3,
                  },
                }}
              >
                <CardContent>
                  <Stack spacing={2}>
                    {/* User Info Section */}
                    <Stack direction='row' spacing={2} alignItems='center'>
                      <Avatar
                        src={review.buyer?.profile_image_url || userImage}
                        alt={review.buyer_id}
                        sx={{ width: 48, height: 48 }}
                      />
                      <Stack spacing={0.5} sx={{ flexGrow: 1 }}>
                        <Typography
                          variant='subtitle1'
                          sx={{
                            fontWeight: 500,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {`${review.buyer?.first_name} ${review.buyer?.last_name}`}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          { review.timestamp ? new Date(review.timestamp).toDateString() : 'No Date Provided'}
                        </Typography>
                      </Stack>
                    </Stack>

                    {/* Rating Section */}
                    <Stack direction='row' spacing={1} alignItems='center'>
                      <Rating
                        value={review.rating}
                        readOnly
                        size='small'
                      />
                      <Typography
                        variant='body2'
                        color='text.secondary'
                      >
                        {`(${review.rating} / 5 stars)`}
                      </Typography>
                    </Stack>

                    {/* Review Comment */}
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{
                        height: 80,
                        overflowY: 'auto',
                        '&::-webkit-scrollbar': {
                          width: '8px',
                        },
                        '&::-webkit-scrollbar-track': {
                          background: '#f1f1f1',
                          borderRadius: '4px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                          background: '#888',
                          borderRadius: '4px',
                        },
                        '&::-webkit-scrollbar-thumb:hover': {
                          background: '#555',
                        },
                      }}
                    >
                      {review.feedback_message}
                    </Typography>

                    {/* Interactive Elements */}
                    <Box
                      sx={{
                        pt: 2,
                        borderTop: 1,
                        borderColor: 'divider',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                      }}
                    >
                      <Button
                        startIcon={<ThumbUp fontSize='small' />}
                        size='small'
                        color='primary'
                      >
                        Helpful
                      </Button>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Stack>
      {modalOpen && (
        <CreateFeedbackModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          sellerId={sellerId}
        />
      )}
    </Grid>
  );
}
