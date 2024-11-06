import Grid from '@mui/material/Grid';
import {
  Button, CircularProgress, Fade, InputAdornment, TextField,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Stack from '@mui/material/Stack';
import FilterListIcon from '@mui/icons-material/FilterList';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ProductCard from 'pages/HomePage/components/ProductCard';
import { useCallback, useState } from 'react';
import { IProduct, useSearchProducts } from 'pages/HomePage/queries';
import { TApiResponse } from 'utils/apiResponse.type';
import Typography from '@mui/material/Typography';
import debounce from 'lodash/debounce';
import SearchLoadingState from './SearchLoadingState';


type TProps = {
  productsData: TApiResponse<IProduct[]>;
  showEditButton?: boolean;
}

export default function ProductList({ productsData, showEditButton = false }: TProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: searchResults, isLoading: isSearching } = useSearchProducts(searchTerm, {
    enabled: searchTerm.length >= 2,
    queryKey: ['products', 'search', searchTerm],
  });

  const debouncedSearch = useCallback((term: string) => {
    const handleSearch = debounce((value: string) => {
      setSearchTerm(value);
    }, 300);
    handleSearch(term);
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    debouncedSearch(newValue);
  };

  const displayedProducts = searchTerm.length >= 2
    ? searchResults?.data || []
    : productsData.data;

  return (
    <>
      <Grid container item xs={12} alignItems='center' spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4} md={3}>
          <TextField
            fullWidth
            variant='outlined'
            placeholder='Search...'
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: isSearching && (
                <InputAdornment position='end'>
                  <CircularProgress size={20} />
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

      {/* Searching State */}
      <SearchLoadingState
        isSearching={isSearching}
        searchTerm={searchTerm}
      />

      {/* Product Grid - Hidden while searching */}
      <Fade in={!isSearching || searchTerm.length < 2} timeout={300}>
        <Grid
          container
          item
          xs={12}
          spacing={3}
          style={{
            display: (isSearching && searchTerm.length >= 2) ? 'none' : 'flex',
          }}
        >
          {displayedProducts?.length === 0 ? (
            <Grid item xs={12} style={{ textAlign: 'center', marginTop: '20px' }} data-testid='empty-screen'>
              <Typography variant='h6'>No listings found</Typography>
            </Grid>
          ) : (
            displayedProducts.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id} data-testid='product-card'>
                <ProductCard product={product} showEditButton={showEditButton} />
              </Grid>
            ))
          )}
        </Grid>
      </Fade>
    </>
  );
}
