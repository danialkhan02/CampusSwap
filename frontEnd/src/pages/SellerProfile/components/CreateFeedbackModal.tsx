import {
  Box, Dialog, Grid, Typography,
} from '@mui/material';
import SpinnerButton from 'components/Common/SpinnerButton';
import Stack from '@mui/material/Stack';
import PublishIcon from '@mui/icons-material/Publish';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import React from 'react';


type TProps = {
    isOpen: boolean,
    onClose: () => void,
}

export default function CreateFeedbackModal({ isOpen, onClose }: TProps) {
  const handlePublish = () => {
    // do something
  };
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullWidth
      maxWidth='lg'
      PaperProps={{
        sx: { width: '90%', height: '100%', overflow: 'hidden' },
      }}
    >
      <Box display='flex' flexDirection='row' sx={{ height: '100%' }}>
        <Box
          flex='0 0 30%'
          paddingY={4}
          paddingX={2}
          bgcolor='#F8F8F8'
          sx={{ maxHeight: '100%', overflowY: 'auto' }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant='h4'>Add a review</Typography>
            </Grid>
          </Grid>
        </Box>
        <Box flex='0 0 70%' paddingY={4} paddingX={2} sx={{ maxHeight: '100%', overflowY: 'auto' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box display='flex' alignItems='center' justifyContent='space-between'>
                <Typography variant='h4'>Preview</Typography>
                <Stack direction='row' spacing={1}>
                  <SpinnerButton
                    variant='contained'
                    startIcon={<PublishIcon />}
                    sx={{ alignSelf: 'flex-end' }}
                    onClick={handlePublish}
                    isLoading={false}
                  >
                    Publish Review
                  </SpinnerButton>
                  <IconButton onClick={onClose}>
                    <CloseIcon />
                  </IconButton>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Dialog>
  );
}
