import {
  Box, Button, FormHelperText, Typography,
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import React, { useCallback, useRef, useState } from 'react';


type TProps = {
    images: string[];
    handleRemoveImage: (index: number) => void;
    handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
    error?: boolean;
    helperText?: string;
};

const MAX_IMAGES = 5;
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
];

export default function ImageButton({
  images, handleRemoveImage, handleImageUpload, helperText, error = false,
}: TProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isDragError, setIsDragError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showError = useCallback((message: string) => {
    setIsDragError(true);
    setIsDragging(true);
    setErrorMessage(message);

    setTimeout(() => {
      setIsDragError(false);
      setIsDragging(false);
      setErrorMessage(null);
    }, 3000);
  }, []);

  const validateAndUpload = useCallback((files: File[]) => {
    if (files.length > MAX_IMAGES) {
      showError(`You can only upload up to ${MAX_IMAGES} images`);
      return false;
    }

    const imageFiles = Array.from(files).filter((file) => ALLOWED_IMAGE_TYPES.includes(file.type));

    if (imageFiles.length !== files.length) {
      showError('Only JPG, PNG, GIF and WebP images are allowed');
      return false;
    }

    const fakeEvent = {
      target: {
        files: imageFiles,
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    handleImageUpload(fakeEvent);
    return true;
  }, [handleImageUpload, showError]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const items = Array.from(e.dataTransfer.items);

    setIsDragging(true);

    // Check invalid types first
    if (items.some((item) => !ALLOWED_IMAGE_TYPES.includes(item.type))) {
      setIsDragError(true);
      setErrorMessage('Only JPG, PNG, GIF and WebP images are allowed');
    }
    else if (items.length > MAX_IMAGES) {
      setIsDragError(true);
      setErrorMessage(`You can only upload up to ${MAX_IMAGES} images`);
    }
    else {
      setIsDragError(false);
      setErrorMessage(null);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
      return;
    }
    setIsDragging(false);
    setIsDragError(false);
    setErrorMessage(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setIsDragError(false);
    setErrorMessage(null);

    const files = Array.from(e.dataTransfer.files);
    validateAndUpload(files);
  }, [validateAndUpload]);

  const handleFileInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      validateAndUpload(files);
    }

    // Reset input value to allow selecting same files again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [validateAndUpload]);

  const getBorderColor = () => {
    if (isDragError) return '#d32f2f';
    if (isDragging) return '#2196f3';
    if (error) return '#d32f2f';
    return '#ccc';
  };

  const renderDragOverlay = () => (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: isDragError
          ? 'rgba(211, 47, 47, 0.12)'
          : 'rgba(33, 150, 243, 0.12)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        borderRadius: '8px',
        zIndex: 10,
        animation: 'fadeIn 0.2s ease-in',
        '@keyframes fadeIn': {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
      }}
    >
      {isDragError ? (
        <>
          <ErrorOutlineIcon sx={{
            fontSize: 48,
            color: '#d32f2f',
          }}
          />
          <Typography variant='body1' color='error' sx={{ fontWeight: 'bold', ml: '10px' }}>
            {errorMessage}
          </Typography>
        </>
      ) : (
        <>
          <UploadFileIcon sx={{
            fontSize: 48,
            color: '#2196f3',
            animation: 'bounce 1s infinite',
            '@keyframes bounce': {
              '0%, 100%': {
                transform: 'translateY(0)',
              },
              '50%': {
                transform: 'translateY(-10px)',
              },
            },
          }}
          />
          <Typography variant='h6' color='primary' sx={{ fontWeight: 'bold' }}>
            Drop your images here
          </Typography>
          <Typography variant='caption' color='textSecondary'>
            Supported formats: JPG, PNG, GIF, WebP
          </Typography>
        </>
      )}
    </Box>
  );

  return (
    <Box>
      <Box
        sx={{
          border: `2px dashed ${getBorderColor()}`,
          borderRadius: '8px',
          padding: '16px',
          minHeight: '150px',
          width: '100%',
          position: 'relative',
          transition: 'all 0.2s ease',
          backgroundColor: error ? 'rgba(211, 47, 47, 0.04)' : 'transparent',
        }}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging && renderDragOverlay()}
        <Box sx={{
          opacity: isDragging ? 0.3 : 1,
          transition: 'opacity 0.2s ease',
        }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, 70px)',
              gap: 2,
              justifyContent: 'start',
            }}
          >
            {images.map((image, index) => (
              <Box key={image} position='relative' width='70px' height='70px'>
                <img
                  src={image}
                  alt={`Preview ${index}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: 4,
                  }}
                />
                <IconButton
                  size='small'
                  className='deleteButton'
                  sx={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    boxShadow: 1,
                    opacity: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 1)',
                    },
                  }}
                  onClick={() => handleRemoveImage(index)}
                >
                  <CloseIcon fontSize='small' />
                </IconButton>
              </Box>
            ))}
          </Box>
          {images.length === 0 && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                mt: 2,
                gap: 1,
              }}
            >
              <PhotoCameraIcon sx={{ fontSize: 42, color: error ? '#d32f2f' : '#aaa', mb: 0.5 }} />
              <Typography variant='body2' color={error ? 'error' : 'textSecondary'}>
                Drag and drop images here
              </Typography>
              <Button variant='contained' component='label' size='small' color={error ? 'error' : 'inherit'}>
                Browse Files
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='.jpg,.jpeg,.png,.gif,.webp'
                  multiple
                  hidden
                  onChange={handleFileInputChange}
                />
              </Button>
              <Typography variant='caption' color='textSecondary'>
                Select up to
                {' '}
                {MAX_IMAGES}
                {' '}
                images
              </Typography>
              <Typography variant='caption' color='textSecondary'>
                Supported formats: JPG, PNG, GIF, WebP
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
      {(helperText || errorMessage) && (
        <FormHelperText
          error={error || !!errorMessage}
          sx={{
            ml: 1.75,
            minHeight: '1.25rem',
          }}
        >
          {errorMessage || helperText}
        </FormHelperText>
      )}
    </Box>
  );
}
