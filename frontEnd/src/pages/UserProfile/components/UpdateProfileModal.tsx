import React, { useContext, useState } from 'react';
import {
  Dialog, Grid, Box, Typography, TextField, Button,
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import PublishIcon from '@mui/icons-material/Publish';
import SpinnerButton from 'components/Common/SpinnerButton';
import { AppAlertsCtx } from 'components/Common/AppAlerts';
import Stack from '@mui/material/Stack';
import { useQueryClient } from '@tanstack/react-query';
import { IUser, userQueryKey, useUpdateUser } from 'pages/Authentication/queries';
import UserPreview from 'pages/UserProfile/components/UserPreview';


type TProps = {
    isOpen: boolean;
    onClose: () => void;
    currentUser: IUser;
}

export default function UpdateProfileModal({
  isOpen,
  onClose,
  currentUser,
}: TProps) {
  const queryClient = useQueryClient();
  const updateUserHook = useUpdateUser(currentUser.id || '');
  const { addAlert } = useContext(AppAlertsCtx);
  const [User, setUser] = useState<IUser>(currentUser);

  const handleUserInputChange = (field: keyof IUser, value: string) => {
    setUser((prevUser) => ({
      ...prevUser,
      [field]: value,
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;

    if (!file) return;

    const readFileAsBase64 = (fileToLoad: File): Promise<string> => new Promise(
      (resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          }
          else {
            reject(new Error('Failed to convert file to base64'));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(fileToLoad);
      },
    );

    try {
      const base64String = await readFileAsBase64(file);

      setUser((prevUser) => ({
        ...prevUser,
        profile_image_url: base64String,
      }));
    }
    catch (error) {
      addAlert({
        type: 'error',
        message: 'Error uploading image. Please try again.',
      });
    }
  };

  const handleRemoveImage = () => {
    setUser((prevUser) => ({
      ...prevUser,
      profile_image_url: '',
    }));
  };

  const handlePublish = () => {
    updateUserHook.mutate(User, {
      onSuccess: () => {
        addAlert({
          type: 'success',
          message: 'User information updated successfully',
        });
        onClose();
        queryClient.invalidateQueries(
          { queryKey: userQueryKey(currentUser?.id || '') },
        );
      },
      onError: () => {
        addAlert({
          type: 'error',
          message: 'Listing update failed',
        });
      },
    });
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
              <Typography variant='h4'>Edit User Information</Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size='medium'
                label='Description'
                value={User?.description || ''}
                onChange={(event) => handleUserInputChange('description', event.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size='medium'
                label='Phone Number'
                value={User?.phone_number || ''}
                onChange={(event) => handleUserInputChange('phone_number', event.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size='medium'
                label='Location'
                value={User?.location || ''}
                onChange={(event) => handleUserInputChange('location', event.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant='contained' component='label'>
                Upload Avatar Image
                <input
                  type='file'
                  accept='image/*'
                  hidden
                  onChange={handleImageUpload}
                />
              </Button>
            </Grid>
            <Grid item xs={12}>
              {/* Image Preview Grid */}
              <Box display='flex' flexWrap='wrap' gap={2}>
                {User.profile_image_url && (
                  <Box position='relative' width='70px' height='70px'>
                    <img
                      src={User.profile_image_url}
                      alt='Preview'
                      style={{
                        width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4,
                      }}
                    />
                    <IconButton
                      size='small'
                      sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                      }}
                      onClick={() => handleRemoveImage()}
                    >
                      <CloseIcon fontSize='small' />
                    </IconButton>
                  </Box>
                )}
              </Box>
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
                  >
                    Update User Information
                  </SpinnerButton>
                  <IconButton onClick={onClose}><CloseIcon /></IconButton>
                </Stack>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <UserPreview userInfo={User} />
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Dialog>
  );
}
