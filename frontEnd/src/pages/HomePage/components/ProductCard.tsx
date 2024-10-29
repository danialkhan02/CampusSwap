import React from 'react';
import {
  Box, Card, CardMedia, CardContent, Typography,
} from '@mui/material';
import { IProduct } from 'pages/HomePage/queries';
import Link from '@mui/material/Link';


export default function ProductCard({ product }: { product: IProduct }) {
  return (
    <Link href={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
      <Card sx={{
        position: 'relative',
        borderRadius: '8px',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'scale(1.05)',
          boxShadow: 6,
        },
      }}
      >
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
            <Typography variant='h6' color='textPrimary'>
              $
              {product.price}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Link>
  );
}
