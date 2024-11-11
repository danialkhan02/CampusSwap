import {
  Alert,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Rating,
  Select,
  TextField,
} from '@mui/material';
import Stack from '@mui/material/Stack';
import React, { useContext, useState } from 'react';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import MenuItem from '@mui/material/MenuItem';
import { IReview, sellerReviewQueryKey, useCreateSellerFeedback } from 'pages/SellerProfile/queries';
import { retrieve } from 'utils/cacheUtils';
import { CacheKeys } from 'utils/constants';
import Typography from '@mui/material/Typography';
import { useQueryClient } from '@tanstack/react-query';
import { AppAlertsCtx } from 'components/Common/AppAlerts';


type TProps = {
  isOpen: boolean,
  onClose: () => void,
  sellerId: string,
}

export default function CreateFeedbackModal({ isOpen, onClose, sellerId }: TProps) {
  const queryClient = useQueryClient();
  const { addAlert } = useContext(AppAlertsCtx);
  const [showMessage, setShowMessage] = useState(true);
  const createSellerFeedbackHook = useCreateSellerFeedback();
  const [review, setReview] = useState<IReview>({
    userName: '',
    rating: 0,
    feedback_message: '',
    avatarUrl: '',
    buyer_id: retrieve(CacheKeys.userId, { parseJson: false }),
    seller_id: sellerId,
    verified_purchase: false,
  });

  const handleReviewChange = (field: keyof IReview, value: any) => {
    setReview((prevReview) => ({
      ...prevReview,
      [field]: value,
    }));
  };

  const handlePublish = () => {
    createSellerFeedbackHook.mutate(review, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: sellerReviewQueryKey(sellerId) });
        addAlert({
          type: 'success',
          message: 'Seller review submitted successfully',
        });
        onClose();
      },
    });
  };
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullWidth
      maxWidth='sm'
    >
      <DialogTitle sx={{
        fontWeight: 500,
      }}
      >
        Seller Review
      </DialogTitle>

      {/* Status Alert */}
      {showMessage && (
      <Box sx={{ px: 3 }}>
        <Alert
          variant='outlined'
          severity='info'
          sx={{ mb: 3 }}
          action={(
            <IconButton onClick={() => setShowMessage(false)}>
              {' '}
              <CloseIcon fontSize='small' color='info' />
            </IconButton>
                )}
        >
          Review will be made public to everyone
        </Alert>
      </Box>
      )}
      <DialogContent>
        <Stack spacing={3}>
          {/* Status Select */}

          {/* Two column grid */}
          <Stack direction='row' spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Item Purchased</InputLabel>
              <Select<boolean>
                fullWidth
                size='medium'
                label='Item Purchased'
                value={review.verified_purchase}
                onChange={(event) => {
                  const value = Boolean(event.target.value);
                  handleReviewChange('verified_purchase', value);
                }}
              >
                <MenuItem value='true'>Yes</MenuItem>
                <MenuItem value='false'>No</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label='Date Added'
              disabled
              defaultValue={new Date().toDateString()}
            />
          </Stack>

          <Stack direction='row' spacing={2}>
            <TextField
              fullWidth
              multiline
              value={review.feedback_message}
              onChange={(e) => handleReviewChange('feedback_message', e.target.value)}
              label='Review'
            />
          </Stack>

          <Stack
            direction='column'
            spacing={1}
            alignItems='center'
            sx={{
              py: 3,
              px: 2,
              bgcolor: 'grey.50',
              borderRadius: 1,
            }}
          >
            <Typography variant='body2' color='text.secondary'>
              Rate your experience with the seller
            </Typography>
            <Rating
              value={review.rating}
              defaultValue={0}
              max={5}
              onChange={(_, value) => handleReviewChange('rating', value)}
              sx={{
                '& .MuiRating-icon': {
                  fontSize: '2rem',
                },
                '& .MuiRating-iconFilled': {
                  color: '#FFB800',
                },
                '& .MuiRating-iconHover': {
                  color: '#FFB800',
                },
              }}
            />
            <Typography variant='caption' color='text.secondary'>
              {review.rating > 0
                ? `${review.rating} out of 5 stars`
                : 'Click to rate'}
            </Typography>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button
          variant='outlined'
          color='inherit'
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          variant='contained'
          onClick={handlePublish}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}
