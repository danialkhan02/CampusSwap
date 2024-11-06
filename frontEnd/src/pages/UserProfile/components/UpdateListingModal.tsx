import React, { useContext, useState } from 'react';
import {
  Dialog, Grid, Box, Typography, TextField, Button, InputLabel, Select, FormControl,
} from '@mui/material';
import ListingPreview from 'pages/UserProfile/components/ListingPreview';
import {
  IProduct, listerProductListQueryKey, useUpdateProduct,
} from 'pages/HomePage/queries';
import LocationAutocomplete from 'pages/UserProfile/components/GoogleMapTextField';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import PublishIcon from '@mui/icons-material/Publish';
import SpinnerButton from 'components/Common/SpinnerButton';
import { AppAlertsCtx } from 'components/Common/AppAlerts';
import Stack from '@mui/material/Stack';
import { useQueryClient } from '@tanstack/react-query';
import MenuItem from '@mui/material/MenuItem';
import {
  categoryParsed, conditionParsed, ECategory, ECondition,
} from 'pages/HomePage/constants';


type TProps = {
    isOpen: boolean;
    onClose: () => void;
    currentListing: IProduct;
}

export default function UpdateListingModal({
  isOpen,
  onClose,
  currentListing,
}: TProps) {
  const queryClient = useQueryClient();
  const updateProductHook = useUpdateProduct(currentListing.id || '');
  const { addAlert } = useContext(AppAlertsCtx);
  const [Listing, setListing] = useState<IProduct>({
    ...currentListing,
    lister_id: currentListing.seller?.id || '',
  });

  const handleListingInputChange = (field: keyof IProduct, value: string) => {
    setListing((prevListing) => ({
      ...prevListing,
      [field]: field === 'price' ? parseFloat(value) || 0 : value, // Ensure price is a number
    }));
  };

  const handleLocationChange = (address: string, latitude?: number, longitude?: number) => {
    setListing((prevListing) => ({
      ...prevListing,
      location: {
        ...prevListing.location,
        address,
        latitude: latitude ?? prevListing.location.latitude,
        longitude: longitude ?? prevListing.location.longitude,
      },
    }));
  };

  const handlePublish = () => {
    updateProductHook.mutate(Listing, {
      onSuccess: () => {
        addAlert({
          type: 'success',
          message: 'Listing updated successfully',
        });
        onClose();
        queryClient.invalidateQueries(
          { queryKey: listerProductListQueryKey(currentListing.seller?.id || '') },
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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(
      event.target.files,
    ).slice(0, 5) : [];
    const base64Images: string[] = [];

    const readFileAsBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
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
      reader.readAsDataURL(file);
    });

    try {
      for (const file of files) {
        // eslint-disable-next-line no-await-in-loop
        const base64String = await readFileAsBase64(file);
        base64Images.push(base64String);
      }

      setListing((prevListing) => ({
        ...prevListing,
        images: base64Images,
      }));
    }
    catch (error) {
      addAlert({
        type: 'error',
        message: 'Error Uploading Images. Cannot upload more than 5 images',
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setListing((prevListing) => ({
      ...prevListing,
      images: prevListing.images.filter((_, i) => i !== index),
    }));
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
              <Typography variant='h4'>Edit Listing</Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size='medium'
                label='Item Name'
                value={Listing?.name || ''}
                onChange={(event) => handleListingInputChange('name', event.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size='medium'
                label='Price'
                type='number'
                value={Listing.price || 0}
                onChange={(event) => handleListingInputChange('price', event.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Condition</InputLabel>
                <Select
                  fullWidth
                  size='medium'
                  label='Condition'
                  value={Listing.condition}
                  onChange={(event) => handleListingInputChange('condition', event.target.value)}
                  displayEmpty
                >
                  <MenuItem value='' disabled>Select Condition</MenuItem>
                  {Object.values(ECondition).map((condition) => (
                    <MenuItem key={condition} value={condition}>
                      {conditionParsed.parse(condition).title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size='medium'
                label='Description'
                value={Listing?.description || ''}
                onChange={(event) => handleListingInputChange('description', event.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  fullWidth
                  size='medium'
                  label='Category'
                  value={Listing.category}
                  onChange={(event) => handleListingInputChange('category', event.target.value)}
                  displayEmpty
                >
                  <MenuItem value='' disabled>Select Category</MenuItem>
                  {Object.values(ECategory).map((category) => (
                    <MenuItem key={category} value={category}>
                      {categoryParsed.parse(category).title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <LocationAutocomplete
                input={Listing?.location.address || ''}
                setInput={handleLocationChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant='contained' component='label'>
                Upload Images
                <input
                  type='file'
                  accept='image/*'
                  multiple
                  hidden
                  onChange={handleImageUpload}
                />
              </Button>
            </Grid>
            <Grid item xs={12}>
              {/* Image Preview Grid */}
              <Box display='flex' flexWrap='wrap' gap={2}>
                {Listing.images.map((image, index) => (
                  <Box position='relative' width='70px' height='70px'>
                    <img
                      src={image}
                      alt={`Preview ${index}`}
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
                      onClick={() => handleRemoveImage(index)}
                    >
                      <CloseIcon fontSize='small' />
                    </IconButton>
                  </Box>
                ))}
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
                    Update Listing
                  </SpinnerButton>
                  <IconButton onClick={onClose}><CloseIcon /></IconButton>
                </Stack>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <ListingPreview listing={Listing} />
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Dialog>
  );
}
