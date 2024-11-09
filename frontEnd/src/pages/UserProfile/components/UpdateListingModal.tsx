import React, { useContext, useEffect, useState } from 'react';
import {
  Box, Button, Dialog, FormControl, Grid, InputLabel, Select, TextField, Typography,
} from '@mui/material';
import ListingPreview from 'pages/UserProfile/components/ListingPreview';
import {
  IProduct,
  listerProductListQueryKey,
  productDetailsQueryKey,
  useGetProductDetails,
  useUpdateProduct,
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
import Spinner from 'components/Common/Spinner';


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
  const { data: productDetailsData, isLoading } = useGetProductDetails(currentListing?.id || '', {
    enabled: !!currentListing.id,
    queryKey: productDetailsQueryKey(currentListing.id || ''),
  });

  const [listing, setListing] = useState<IProduct | null>(null);

  // Update listing state when productDetailsData changes
  useEffect(() => {
    if (productDetailsData?.data) {
      setListing({
        ...productDetailsData.data,
        lister_id: currentListing.seller?.id || '',
        images: productDetailsData.data.images || [], // Ensure images array exists
        location: {
          ...productDetailsData.data.location,
          address: productDetailsData.data.location?.address || '',
          latitude: productDetailsData.data.location?.latitude || 0,
          longitude: productDetailsData.data.location?.longitude || 0,
        },
      });
    }
  }, [productDetailsData, currentListing.seller?.id]);

  const handleListingInputChange = (field: keyof IProduct, value: string) => {
    if (!listing) return;

    setListing({
      ...listing,
      [field]: field === 'price' ? parseFloat(value) || 0 : value,
    });
  };

  const handleLocationChange = (address: string, latitude?: number, longitude?: number) => {
    if (!listing) return;

    setListing({
      ...listing,
      location: {
        ...listing.location,
        address,
        latitude: latitude ?? listing.location.latitude,
        longitude: longitude ?? listing.location.longitude,
      },
    });
  };

  const handlePublish = () => {
    if (!listing) return;

    updateProductHook.mutate(listing, {
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
    if (!listing) return;

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

      setListing({
        ...listing,
        images: base64Images,
      });
    }
    catch (error) {
      addAlert({
        type: 'error',
        message: 'Error Uploading Images. Cannot upload more than 5 images',
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    if (!listing) return;

    setListing({
      ...listing,
      images: listing.images.filter((_, i) => i !== index),
    });
  };

  if (!productDetailsData || !productDetailsData.data || isLoading || !listing) {
    return <Spinner />;
  }

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
                value={listing.name || ''}
                onChange={(event) => handleListingInputChange('name', event.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size='medium'
                label='Price'
                type='number'
                value={listing.price || 0}
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
                  value={listing.condition || ''}
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
                value={listing.description || ''}
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
                  value={listing.category || ''}
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
                input={listing.location.address || ''}
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
              <Box display='flex' flexWrap='wrap' gap={2}>
                {listing.images.map((image, index) => (
                  <Box key={image} position='relative' width='70px' height='70px'>
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
              <ListingPreview listing={listing} />
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Dialog>
  );
}
