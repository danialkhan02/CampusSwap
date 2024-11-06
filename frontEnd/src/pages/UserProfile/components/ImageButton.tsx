import { Box, Button, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import React from 'react';


type TProps = {
    images: string[],
    handleRemoveImage: (index: number) => void,
    handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>,
};

export default function ImageButton({ images, handleRemoveImage, handleImageUpload }: TProps) {
  return (
    <Box
      sx={{
        border: '1px dashed #ccc',
        borderRadius: '8px',
        padding: '16px',
        minHeight: '150px',
        width: '100%',
      }}
    >
      {images.length > 0 ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, 70px)',
            gap: 2,
            justifyContent: 'start',
          }}
        >
          {images.map((image, index) => (
            <Box
              key={image}
              position='relative'
              width='70px'
              height='70px'
            >
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
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            gap: 2,
          }}
        >
          <PhotoCameraIcon sx={{ fontSize: 48, color: '#aaa' }} />
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
          <Typography variant='body2' color='textSecondary'>
            Or drag and drop images here
          </Typography>
        </Box>
      )}
    </Box>
  );
}
