import Avatar from '@mui/material/Avatar';
import { Paper, Stack, Typography } from '@mui/material';
import React from 'react';
import { IProduct } from 'pages/HomePage/queries';
import userImage from 'assets/avatar-25.webp';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';


type TProps = {
    product: IProduct;
    handleRemove: () => void;
}

export default function ChatInquiryRender({ product, handleRemove }: TProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        mb: 2,
        bgcolor: '#f8f9fa',
        position: 'relative',
      }}
    >
      {/* Close Button */}
      <IconButton
        onClick={handleRemove}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 1,
          color: 'text.secondary',
        }}
      >
        <CloseIcon />
      </IconButton>

      {/* Product Image */}
      <Avatar
        variant='square'
        src={product.images[0]}
        alt={product.name}
        sx={{
          width: 120,
          height: 120,
          borderRadius: 0,
          objectFit: 'cover',
        }}
      />

      {/* Product Info */}
      <Stack
        spacing={0.5}
        sx={{
          p: 2,
          flex: 1,
          minWidth: 0, // For text truncation
        }}
      >
        {/* Price */}
        <Typography
          variant='h6'
          sx={{
            fontWeight: 600,
            color: 'primary.main',
            fontSize: '1.125rem',
          }}
        >
          $
          {product.price % 1 === 0 ? product.price.toFixed(0) : product.price.toFixed(2)}
        </Typography>

        {/* Title with ellipsis */}
        <Typography
          variant='body1'
          sx={{
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {product.name}
        </Typography>

        {/* Seller Info */}
        <Stack
          direction='row'
          spacing={1}
          alignItems='center'
          sx={{
            mt: 'auto !important',
            pt: 1,
          }}
        >
          <Avatar
            src={product.seller?.profile_image_url || userImage}
            sx={{
              width: 20,
              height: 20,
            }}
          >
            {product.seller?.profile_image_url || userImage}
          </Avatar>
          <Typography
            variant='subtitle2'
            color='text.secondary'
            sx={{
              fontWeight: 500,
            }}
          >
            {product.seller?.first_name}
            {' '}
            {product.seller?.last_name.slice(0, 1)}
            .
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
}
