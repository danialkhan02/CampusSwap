import { LinearProgress, Stack, Typography } from '@mui/material';
import { IReview } from 'pages/SellerProfile/queries';


type TProps = {
    reviews: IReview[];
}

export default function RatingLines({ reviews }: TProps) {
  const distribution: Record<number, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  reviews.forEach((review) => {
    const { rating } = review;
    if (rating >= 1 && rating <= 5) {
      distribution[Math.floor(rating)] += 1;
    }
  });

  return (
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
            value={reviews.length > 0 ? ((distribution[star] || 0) / reviews.length) * 100 : 0}
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
            {distribution[star] || 0}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}
