import { Button, InputAdornment, TextField } from '@mui/material';
import Grid from '@mui/material/Grid';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Typography from '@mui/material/Typography';
import ProductCard from 'pages/HomePage/components/ProductCard';
import productImage1 from 'assets/product-1.webp';
import productImage2 from 'assets/product-2.webp';
import productImage3 from 'assets/product-3.webp';
import productImage4 from 'assets/product-4.webp';
import productImage5 from 'assets/product-5.webp';
import productImage6 from 'assets/product-6.webp';
import Stack from '@mui/material/Stack';
import { useState } from 'react';
import Fuse from 'fuse.js';
import { IProduct } from 'pages/HomePage/queries';
import { OauthAuthenticationType } from 'pages/Authentication/queries';


export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const productsData: IProduct[] = [
    {
      id: '1',
      name: 'Urban Explorer Sneakers',
      price: 35.71,
      image: `${productImage1}`,
      seller: {
        id: '1',
        first_name: 'Payas',
        last_name: 'Hasteer',
        email: 'payas.hasteer@mail.utoronto.ca',
        provider: OauthAuthenticationType.OAUTH_AUTHENTICATION_TYPE_MICROSOFT,
        stytch_id: 'stytch-1',
        oauth_id: 'oauth-1',
      },
      interested_buyers: [],
      location: {
        latitude: 1,
        longitude: 1,
        address: '450 Front St W.',
      },
    },
    {
      id: '2',
      name: 'Classic Leather Loafers',
      price: 35.54,
      image: `${productImage2}`,
      seller: {
        id: '1',
        first_name: 'Payas',
        last_name: 'Hasteer',
        email: 'payas.hasteer@mail.utoronto.ca',
        provider: OauthAuthenticationType.OAUTH_AUTHENTICATION_TYPE_MICROSOFT,
        stytch_id: 'stytch-1',
        oauth_id: 'oauth-1',
      },
      interested_buyers: [],
      location: {
        latitude: 1,
        longitude: 1,
        address: '450 Front St W.',
      },
    },
    {
      id: '3',
      name: 'Urban Explorer Sneakers',
      price: 35.71,
      image: `${productImage3}`,
      seller: {
        id: '1',
        first_name: 'Payas',
        last_name: 'Hasteer',
        email: 'payas.hasteer@mail.utoronto.ca',
        provider: OauthAuthenticationType.OAUTH_AUTHENTICATION_TYPE_MICROSOFT,
        stytch_id: 'stytch-1',
        oauth_id: 'oauth-1',
      },
      interested_buyers: [],
      location: {
        latitude: 1,
        longitude: 1,
        address: '450 Front St W.',
      },
    },
    {
      id: '4',
      name: 'Classic Leather Loafers',
      price: 35.54,
      image: `${productImage4}`,
      seller: {
        id: '1',
        first_name: 'Payas',
        last_name: 'Hasteer',
        email: 'payas.hasteer@mail.utoronto.ca',
        provider: OauthAuthenticationType.OAUTH_AUTHENTICATION_TYPE_MICROSOFT,
        stytch_id: 'stytch-1',
        oauth_id: 'oauth-1',
      },
      interested_buyers: [],
      location: {
        latitude: 1,
        longitude: 1,
        address: '450 Front St W.',
      },
    },
    {
      id: '5',
      name: 'Urban Explorer Sneakers',
      price: 35.71,
      image: `${productImage5}`,
      seller: {
        id: '1',
        first_name: 'Payas',
        last_name: 'Hasteer',
        email: 'payas.hasteer@mail.utoronto.ca',
        provider: OauthAuthenticationType.OAUTH_AUTHENTICATION_TYPE_MICROSOFT,
        stytch_id: 'stytch-1',
        oauth_id: 'oauth-1',
      },
      interested_buyers: [],
      location: {
        latitude: 1,
        longitude: 1,
        address: '450 Front St W.',
      },
    },
    {
      id: '6',
      name: 'Classic Leather Loafers',
      price: 35.54,
      image: `${productImage6}`,
      seller: {
        id: '1',
        first_name: 'Payas',
        last_name: 'Hasteer',
        email: 'payas.hasteer@mail.utoronto.ca',
        provider: OauthAuthenticationType.OAUTH_AUTHENTICATION_TYPE_MICROSOFT,
        stytch_id: 'stytch-1',
        oauth_id: 'oauth-1',
      },
      interested_buyers: [],
      location: {
        latitude: 1,
        longitude: 1,
        address: '450 Front St W.',
      },
    },
  ];

  const fuse = new Fuse(productsData, {
    keys: ['name'],
    threshold: 0.8,
    distance: 100,
  });

  const filteredProducts = searchTerm
    ? fuse.search(searchTerm).map((result) => result.item)
    : productsData;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant='h4' gutterBottom>Shop</Typography>
      </Grid>
      <Grid item xs={3}>
        <TextField
          fullWidth
          variant='outlined'
          placeholder='Search...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      <Grid item xs={9} display='flex' justifyContent='flex-end'>
        <Stack direction='row' spacing={1}>
          <Button endIcon={<FilterListIcon />}>Filters</Button>
          <Button endIcon={<KeyboardArrowDownIcon />}>Sort By: Featured</Button>
        </Stack>
      </Grid>

      {/* Product Grid */}
      <Grid container item xs={12} spacing={3}>
        {filteredProducts.map((product) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product.id} data-testid='product-card'>
            <ProductCard product={product} />
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
}
