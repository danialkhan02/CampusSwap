import React from 'react';
import {
  Box, Card, CardMedia, CardContent, Typography, Chip,
} from '@mui/material';


export default function ProductCard({ product }: { product: any }) {
  return (
    <Card style={{ position: 'relative', borderRadius: '8px' }}>
      {product.isNew && <Chip label='NEW' color='primary' style={{ position: 'absolute', top: 20, left: 20 }} />}
      {product.isOnSale && <Chip label='SALE' color='secondary' style={{ position: 'absolute', top: 20, right: 20 }} />}

      <Box
        style={{
          padding: '8px',
          borderRadius: '8px',
        }}
      >
        <CardMedia
          component='img'
          image={product.image}
          alt={product.name}
          style={{ borderRadius: '4px' }}
        />
      </Box>
      <CardContent>
        <Typography variant='subtitle1' gutterBottom>
          {product.name}
        </Typography>
        <Box display='flex' alignItems='center' justifyContent='space-between'>
          <Typography variant='h6' color={product.isOnSale ? 'secondary' : 'textPrimary'}>
            $
            {product.price}
          </Typography>
          {product.isOnSale && (
            <Typography variant='body2' color='textSecondary' style={{ textDecoration: 'line-through' }}>
              $
              {product.originalPrice}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
