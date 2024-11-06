import Grid from '@mui/material/Grid';
import {
  Button,
  CircularProgress,
  InputAdornment,
  TextField,
  Fade,
  Box,
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

  const debouncedSearch = useCallback(
    debounce((term: string) => {
      setSearchTerm(term);
    }, 300),
    [],
  );

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
      <Fade in={isSearching && searchTerm.length >= 2} timeout={300}>
        <Box
          display={isSearching && searchTerm.length >= 2 ? 'flex' : 'none'}
          flexDirection='column'
          alignItems='center'
          justifyContent='center'
          minHeight='calc(100vh - 300px)'
          width='100%'
          position='absolute'
          top='50%'
          left='50%'
          sx={{
            transform: 'translate(-50%, -50%)',
            zIndex: 1,
          }}
        >
          <CircularProgress size={40} />
          <Typography variant='h6' sx={{ mt: 2 }}>
            'Searching for "'
            {searchTerm}
            '..."'
          </Typography>
        </Box>
      </Fade>

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
