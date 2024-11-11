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
import MenuItem from '@mui/material/MenuItem';
import {
  categoryParsed, conditionParsed, ECategory, ECondition,
} from 'pages/HomePage/constants';
import LocationAutocomplete from 'pages/UserProfile/components/GoogleMapTextField';
import SpinnerButton from 'components/Common/SpinnerButton';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ImageButton from 'pages/UserProfile/components/ImageButton';
import React, {
  useCallback, useContext, useEffect, useState,
} from 'react';
import { IProduct } from 'pages/HomePage/queries';
import { retrieve } from 'utils/cacheUtils';
import { CacheKeys } from 'utils/constants';
import { AppAlertsCtx } from 'components/Common/AppAlerts';
import Stack from '@mui/material/Stack';
import PublishIcon from '@mui/icons-material/Publish';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ListingPreview from 'pages/UserProfile/components/ListingPreview';
import Spinner from 'components/Common/Spinner';


export type ValidatedFields = {
    name: string;
    price: string;
    condition: string;
    category: string;
    location: string;
    description: string;
    images: string;
};

type TProps = {
    isOpen: boolean;
    onClose: () => void;
    initialListing?: IProduct | null;
    isLoading?: boolean;
    mode: 'create' | 'update';
    onSubmit: (listing: IProduct) => Promise<void>;
    title: string;
    submitButtonText: string;
    generateDescription: (params: {
        name: string;
        images: string[];
        category: ECategory;
        condition: ECondition;
    }) => Promise<{ data: { description: string } }>;
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

export default function ListingModalBase({
  isOpen,
  onClose,
  initialListing = null,
  isLoading = false,
  mode,
  onSubmit,
  title,
  submitButtonText,
  generateDescription,
}: TProps) {
  const { addAlert } = useContext(AppAlertsCtx);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [listing, setListing] = useState<IProduct | null>(null);
  const [errors, setErrors] = useState<ValidatedFields>({
    name: '',
    price: '',
    condition: '',
    category: '',
    location: '',
    description: '',
    images: '',
  });

  useEffect(() => {
    if (mode === 'create') {
      const newListing = {
        ...defaultListing,
        lister_id: retrieve(CacheKeys.userId, { parseJson: false }),
      };
      setListing(newListing);
    }
    else if (mode === 'update' && initialListing) {
      setListing(initialListing);
    }
  }, [mode, initialListing]);

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
    if (!listing) return false;
    const newErrors = {
      name: validateField('name', listing.name),
      price: validateField('price', listing.price),
      condition: validateField('condition', listing.condition),
      category: validateField('category', listing.category),
      location: validateField('location', listing.location.address),
      description: validateField('description', listing.description),
      images: validateField('images', listing.images),
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== '');
  }, [listing, validateField]);

  const handleListingInputChange = useCallback((field: keyof IProduct, value: string) => {
    setListing((prevListing) => {
      if (!prevListing) return prevListing;

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
      if (!prevListing) return prevListing;

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
        if (!prevListing) return prevListing;

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
      if (!prevListing) return prevListing;

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

  const handlePublish = useCallback(async () => {
    if (!listing || !validateForm()) return;

    setIsSubmitting(true);
    try {
      // Create a copy of the listing to prevent any race conditions
      const listingToSubmit = { ...listing };
      await onSubmit(listingToSubmit);
      addAlert({
        type: 'success',
        message: mode === 'create' ? 'Listing published successfully' : 'Listing updated successfully',
      });
      onClose();
    }
    catch (error) {
      addAlert({
        type: 'error',
        message: `Listing could not be ${mode === 'create' ? 'published' : 'updated'}`,
      });
    }
    finally {
      setIsSubmitting(false);
    }
  }, [validateForm, listing, onSubmit, mode, addAlert, onClose]);

  const handleAIGeneration = useCallback(async () => {
    if (!listing) return;

    if (listing.images.length === 0 || listing.name === 'Placeholder Text' || listing.name === '' || !listing.category) {
      addAlert({
        type: 'error',
        message: 'Please include product images, title, category, and condition',
      });
      return;
    }

    setIsGeneratingDescription(true);
    try {
      const response = await generateDescription({
        name: listing.name,
        images: listing.images,
        category: listing.category,
        condition: listing.condition || ECondition.CONDITION_NEW,
      });
      handleListingInputChange('description', response?.data.description || '');
    }
    catch (error) {
      addAlert({
        type: 'error',
        message: 'AI failed to generate description',
      });
    }
    finally {
      setIsGeneratingDescription(false);
    }
  }, [listing, generateDescription, handleListingInputChange, addAlert]);

  if (isLoading || !listing) {
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
              <Typography variant='h4'>{title}</Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size='medium'
                label='Item Name'
                value={listing?.name || ''}
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
                value={listing.price || 0}
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
                  value={listing.condition}
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
                  value={listing.category}
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
                input={listing?.location.address || ''}
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
                      isLoading={isGeneratingDescription}
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
                    value={listing?.description || ''}
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
                images={listing.images}
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
                    isLoading={isSubmitting}
                  >
                    {submitButtonText}
                  </SpinnerButton>
                  <IconButton onClick={onClose}>
                    <CloseIcon />
                  </IconButton>
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
