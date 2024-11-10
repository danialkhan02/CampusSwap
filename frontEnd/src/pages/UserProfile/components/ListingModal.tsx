import React, { useCallback, useContext, useState } from 'react';
import {
  Box,
  Dialog,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import ListingPreview from 'pages/UserProfile/components/ListingPreview';
import {
  IProduct,
  listerProductListQueryKey,
  useCreateProduct,
  useGenerateProductDescription,
} from 'pages/HomePage/queries';
import { retrieve } from 'utils/cacheUtils';
import { CacheKeys } from 'utils/constants';
import LocationAutocomplete from 'pages/UserProfile/components/GoogleMapTextField';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PublishIcon from '@mui/icons-material/Publish';
import SpinnerButton from 'components/Common/SpinnerButton';
import { AppAlertsCtx } from 'components/Common/AppAlerts';
import Stack from '@mui/material/Stack';
import { useQueryClient } from '@tanstack/react-query';
import {
  categoryParsed, conditionParsed, ECategory, ECondition,
} from 'pages/HomePage/constants';
import MenuItem from '@mui/material/MenuItem';
import ImageButton from 'pages/UserProfile/components/ImageButton';


type TProps = {
  isOpen: boolean;
  onClose: () => void;
}

type ValidatedFields = {
  name: string;
  price: string;
  condition: string;
  category: string;
  location: string;
  description: string;
  images: string;
};

const defaultListing = {
  name: 'Placeholder Text',
  title: '',
  price: 10.99,
  images: [],
  category: ECategory.CATEGORY_OTHER,
  description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut.',
  lister_id: retrieve(CacheKeys.userId, { parseJson: false }),
  condition: ECondition.CONDITION_NEW,
  location: {
    latitude: 0,
    longitude: 0,
    address: '',
  },
};

export default function ListingModal({
  isOpen,
  onClose,
}: TProps) {
  const queryClient = useQueryClient();
  const userId = retrieve(CacheKeys.userId, { parseJson: false });
  const createProductHook = useCreateProduct();
  const { addAlert } = useContext(AppAlertsCtx);
  const generateDescriptionHook = useGenerateProductDescription();
  const [Listing, setListing] = useState<IProduct>(defaultListing);

  const [errors, setErrors] = useState<ValidatedFields>({
    name: '',
    price: '',
    condition: '',
    category: '',
    location: '',
    description: '',
    images: '',
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const validateField = useCallback((field: keyof ValidatedFields, value: any): string => {
    switch (field) {
      case 'name':
        return !value || value === defaultListing.name ? 'Item name is required' : '';
      case 'price':
        if (!value) return 'Price is required';
        if (value <= 0) return 'Price must be greater than 0';
        return '';
      case 'condition':
        return !value ? 'Condition is required' : '';
      case 'category':
        return !value ? 'Category is required' : '';
      case 'location':
        return !value ? 'Location is required' : '';
      case 'description':
        return !value || value === defaultListing.description ? 'Description is required' : '';
      case 'images':
        return value.length === 0 ? 'At least one image is required' : '';
      default:
        return '';
    }
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {
      name: validateField('name', Listing.name),
      price: validateField('price', Listing.price),
      condition: validateField('condition', Listing.condition),
      category: validateField('category', Listing.category),
      location: validateField('location', Listing.location.address),
      description: validateField('description', Listing.description),
      images: validateField('images', Listing.images),
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== '');
  }, [Listing, validateField]);

  const handleListingInputChange = useCallback((field: keyof IProduct, value: string) => {
    setListing((prevListing) => {
      const newListing = {
        ...prevListing,
        [field]: field === 'price' ? parseFloat(value) || 0 : value,
      };

      // Only validate if there are any existing errors and if the field is a validated field
      if (Object.values(errors).some((error) => error !== '') && field in errors) {
        const errorValue = field === 'price' ? parseFloat(value) || 0 : value;
        setErrors((prev) => ({
          ...prev,
          [field]: validateField(field as keyof ValidatedFields, errorValue),
        }));
      }

      return newListing;
    });
  }, [errors, validateField]);

  const handleLocationChange = useCallback((
    address: string,
    latitude?: number,
    longitude?: number,
  ) => {
    setListing((prevListing) => {
      const newListing = {
        ...prevListing,
        location: {
          ...prevListing.location,
          address,
          latitude: latitude ?? prevListing.location.latitude,
          longitude: longitude ?? prevListing.location.longitude,
        },
      };

      // Only validate if there are any existing errors
      if (Object.values(errors).some((error) => error !== '')) {
        setErrors((prev) => ({
          ...prev,
          location: validateField('location', address),
        }));
      }

      return newListing;
    });
  }, [errors, validateField]);

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

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files).slice(0, 5) : [];
    const base64Images: string[] = [];

    try {
      for (const file of files) {
        // eslint-disable-next-line no-await-in-loop
        const base64String = await readFileAsBase64(file);
        base64Images.push(base64String);
      }

      setListing((prevListing) => {
        const newListing = {
          ...prevListing,
          images: base64Images,
        };

        // Only validate if there are any existing errors
        if (Object.values(errors).some((error) => error !== '')) {
          setErrors((prev) => ({
            ...prev,
            images: validateField('images', base64Images),
          }));
        }

        return newListing;
      });
    }
    catch (error) {
      addAlert({
        type: 'error',
        message: 'Error Uploading Images. Cannot upload more than 5 images',
      });
    }
  }, [errors, validateField, addAlert]);

  const handleRemoveImage = useCallback((index: number) => {
    setListing((prevListing) => {
      const newImages = prevListing.images.filter((_, i) => i !== index);
      const newListing = {
        ...prevListing,
        images: newImages,
      };

      // Only validate if there are any existing errors
      if (Object.values(errors).some((error) => error !== '')) {
        setErrors((prev) => ({
          ...prev,
          images: validateField('images', newImages),
        }));
      }

      return newListing;
    });
  }, [errors, validateField]);

  const handleAIGeneration = useCallback(() => {
    if (Listing.images.length === 0 || Listing.name === 'Placeholder Text' || Listing.name === '' || !Listing.category) {
      addAlert({
        type: 'error',
        message: 'Please include product images, title, category, and condition',
      });
    }
    else {
      generateDescriptionHook.mutate({
        name: Listing.name,
        images: Listing.images,
        category: Listing.category,
        condition: Listing.condition || ECondition.CONDITION_NEW,
      }, {
        onSuccess: (descriptionData) => {
          handleListingInputChange('description', descriptionData?.data.description || '');
        },
        onError: () => {
          addAlert({
            type: 'error',
            message: 'AI failed to generate description',
          });
        },
      });
    }
  }, [Listing, generateDescriptionHook, handleListingInputChange, addAlert]);

  const handlePublish = useCallback(() => {
    if (validateForm()) {
      createProductHook.mutate(Listing, {
        onSuccess: () => {
          addAlert({
            type: 'success',
            message: 'Listing published successfully',
          });
          onClose();
          queryClient.invalidateQueries(
            { queryKey: listerProductListQueryKey(userId || '', userId || '') },
          );
        },
      });
    }
  }, [validateForm, createProductHook, Listing, addAlert, onClose, queryClient, userId]);

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
              <Typography variant='h4'>Create Listing</Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size='medium'
                label='Item Name'
                value={Listing?.name || ''}
                onChange={(event) => handleListingInputChange('name', event.target.value)}
                error={!!errors.name}
                helperText={errors.name}
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
                error={!!errors.price}
                helperText={errors.price}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.condition}>
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
                {errors.condition && <FormHelperText>{errors.condition}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.category}>
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
                {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <LocationAutocomplete
                input={Listing?.location.address || ''}
                setInput={handleLocationChange}
                error={!!errors.location}
                helperText={errors.location}
              />
            </Grid>
            <Grid container spacing={2} item xs={12}>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant='body1'>Description</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <SpinnerButton
                      variant='contained'
                      size='small'
                      isLoading={generateDescriptionHook.isPending}
                      startIcon={<AutoAwesomeIcon />}
                      onClick={handleAIGeneration}
                    >
                      Generate with AI
                    </SpinnerButton>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Box
                  sx={{
                    border: errors.description ? '1px solid #d32f2f' : '1px solid #e0e0e0',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    position: 'relative',
                  }}
                >
                  <TextField
                    variant='standard'
                    placeholder='Enter your item description here...'
                    fullWidth
                    multiline
                    InputProps={{ disableUnderline: true }}
                    value={Listing?.description || ''}
                    onChange={(event) => handleListingInputChange('description', event.target.value)}
                    error={!!errors.description}
                    sx={{
                      '& .MuiInputBase-input': {
                        padding: 0,
                        fontSize: '16px',
                        color: '#757575',
                      },
                    }}
                  />
                  {errors.description && (
                    <FormHelperText error>{errors.description}</FormHelperText>
                  )}
                </Box>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <ImageButton
                images={Listing.images}
                handleImageUpload={handleImageUpload}
                handleRemoveImage={handleRemoveImage}
                error={!!errors.images}
                helperText={errors.images}
              />
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
                    isLoading={createProductHook.isPending}
                  >
                    Publish Listing
                  </SpinnerButton>
                  <IconButton onClick={onClose}>
                    <CloseIcon />
                  </IconButton>
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
