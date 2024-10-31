import Grid from '@mui/material/Grid';
import { Button, InputAdornment, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Stack from '@mui/material/Stack';
import FilterListIcon from '@mui/icons-material/FilterList';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ProductCard from 'pages/HomePage/components/ProductCard';
import Fuse from 'fuse.js';
import { useState } from 'react';
import { IProduct } from 'pages/HomePage/queries';
import { TApiResponse } from 'utils/apiResponse.type';
import Typography from '@mui/material/Typography';


type TProps = {
    productsData: TApiResponse<IProduct[]>
    showEditButton?: boolean
}


export default function ProductList({ productsData, showEditButton = false }: TProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const fuse = new Fuse(productsData.data, {
    keys: ['name'],
    threshold: 0.6,
    distance: 100,
  });

  const filteredProducts = searchTerm
    ? fuse.search(searchTerm).map((result) => result.item)
    : productsData.data;
  return (
    <>
      {/* Search and Filter Controls */}
      <Grid container item xs={12} alignItems='center' spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4} md={3}>
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
        <Grid item xs={12} sm={8} md={9} display='flex' justifyContent='flex-end'>
          <Stack direction='row' spacing={1}>
            <Button endIcon={<FilterListIcon />}>Filters</Button>
            <Button endIcon={<KeyboardArrowDownIcon />}>Sort By: Featured</Button>
          </Stack>
        </Grid>
      </Grid>

      {/* Product Grid */}
      <Grid container item xs={12} spacing={3}>
        {filteredProducts?.length === 0 ? (
          <Grid item xs={12} style={{ textAlign: 'center', marginTop: '20px' }} data-testid='empty-screen'>
            <Typography variant='h6'>No listings found</Typography>
          </Grid>
        ) : (
          filteredProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id} data-testid='product-card'>
              <ProductCard product={product} showEditButton={showEditButton} />
            </Grid>
          ))
        )}
      </Grid>

    </>
  );
}
