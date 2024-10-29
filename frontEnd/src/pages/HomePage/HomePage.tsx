import { Button, InputAdornment, TextField } from '@mui/material';
import Grid from '@mui/material/Grid';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Typography from '@mui/material/Typography';
import ProductCard from 'pages/HomePage/components/ProductCard';
import Stack from '@mui/material/Stack';
import { useState } from 'react';
import Fuse from 'fuse.js';
import { productListQueryKey, useGetProductList } from 'pages/HomePage/queries';
import Spinner from 'components/Common/Spinner';


export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const {
    data: productsData,
    isLoading: productsListLoading,
  } = useGetProductList({
    queryKey: productListQueryKey(),
  });

  if (!productsData || productsListLoading || !productsData.data) {
    return <Spinner />;
  }

  const fuse = new Fuse(productsData.data, {
    keys: ['name'],
    threshold: 0.6,
    distance: 100,
  });

  const filteredProducts = searchTerm
    ? fuse.search(searchTerm).map((result) => result.item)
    : productsData.data;

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
        {filteredProducts?.map((product) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product.id} data-testid='product-card'>
            <ProductCard product={product} />
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
}
