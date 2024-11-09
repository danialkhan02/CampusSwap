import Grid from '@mui/material/Grid';
import {
  Button, ListItemText, Popover, TextField,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Stack from '@mui/material/Stack';
import FilterListIcon from '@mui/icons-material/FilterList';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ProductCard from 'pages/HomePage/components/ProductCard';
import { useState } from 'react';
import { ILocation, ProductListResponse } from 'pages/HomePage/queries';
import Typography from '@mui/material/Typography';
import {
  ECategory, ECondition, ESort, sortingParsed,
} from 'pages/HomePage/constants';
import FilterDrawer from 'pages/HomePage/components/FilterDrawer';
import { TApiResponse } from 'utils/apiResponse.type';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import IconButton from '@mui/material/IconButton';


type TProps = {
  productsData: TApiResponse<ProductListResponse>;
  showEditButton?: boolean;
  onFilterChange: (newFilters: IFilters) => void;
  onApplyFilter: () => void;
  onClearFilters: () => void;
  filters: IFilters;
  isFiltersApplied: boolean;
  onSortChange: (newSort: ESort) => void;
  onApplySort: () => void;
  onClearSort: () => void;
  activeSort: ESort | null;
  onSearchChange: (newKeyword: string) => void;
  onApplySearch: () => void;
  currentSearch: string;
}

export interface IFilters {
    condition: {
        [K in ECondition]: boolean;
    };
    location: ILocation;
    radius: number;
    category: ECategory | null;
    price: [number, number];
    seller_rating: number;
}

export default function ProductList({
  showEditButton = false,
  productsData, onFilterChange, onApplyFilter, onClearFilters,
  filters, isFiltersApplied, onSortChange, onApplySort, onClearSort, activeSort,
  onSearchChange, onApplySearch, currentSearch,
}: TProps) {
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [tempSort, setTempSort] = useState<ESort | null>(activeSort);

  const handleSortClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSortClose = () => {
    setAnchorEl(null);
  };

  const handleSortSelect = (value: ESort | null) => {
    setTempSort(value);
  };

  const handleApplySort = () => {
    if (tempSort === null) {
      onClearSort();
    }
    else {
      onSortChange(tempSort);
      onApplySort();
    }
    handleSortClose();
  };

  const handleCancelSort = () => {
    handleSortClose();
  };

  const currentSortLabel = activeSort === null ? 'Featured'
    : sortingParsed.parse(activeSort).title;

  const displayedProducts = productsData?.data.items || [];

  return (
    <>
      <Grid container item xs={12} alignItems='center' spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4} md={3}>
          <Box display='flex' flexDirection='column' alignItems='center' gap={2}>
            {/* Search Bar */}
            <TextField
              variant='outlined'
              placeholder='Search Product Listings'
              onChange={(e) => onSearchChange(e.target.value)}
              value={currentSearch}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={onApplySearch}
                    sx={{
                      backgroundColor: currentSearch !== '' ? 'black' : 'inherit',
                      color: currentSearch !== '' ? 'white' : 'inherit',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        color: currentSearch !== '' ? 'white' : 'inherit',
                        backgroundColor: currentSearch !== '' ? 'black' : 'inherit',
                        boxShadow: 6,
                      },
                    }}
                  >
                    <SearchIcon />
                  </IconButton>
                ),
                style: {
                  borderRadius: 25,
                  backgroundColor: '#f0f0f0',
                  paddingLeft: 10,
                  paddingRight: 10,
                },
              }}
              sx={{
                width: 400,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    border: 'none',
                  },
                },
              }}
            />
          </Box>
        </Grid>
        <Grid item xs={12} sm={8} md={9} display='flex' justifyContent='flex-end'>
          <Stack direction='row' spacing={1}>
            <Button
              endIcon={<FilterListIcon />}
              onClick={() => setIsFilterDrawerOpen(true)}
              variant={isFiltersApplied ? 'contained' : 'outlined'}
            >
              Filters
              {' '}
              {isFiltersApplied ? '(Applied)' : ''}
            </Button>
            <Button
              endIcon={<KeyboardArrowDownIcon />}
              onClick={handleSortClick}
              variant={activeSort !== undefined ? 'contained' : 'outlined'}
            >
              Sort By:
              {' '}
              {currentSortLabel}
            </Button>
          </Stack>
        </Grid>
      </Grid>

      {/* Sort Popover */}
      <Popover
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCancelSort}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ width: 250 }}>
          <Box sx={{ p: 2 }}>
            <Typography variant='subtitle1' gutterBottom>Sort By</Typography>
            <MenuItem
              selected={tempSort === null}
              onClick={() => handleSortSelect(null)}
              sx={{ minHeight: 40 }}
            >
              <ListItemIcon sx={{ minWidth: 'auto', ml: 1, mr: 0 }}>
                <AutoAwesomeIcon fontSize='small' />
              </ListItemIcon>
              <ListItemText primary='Featured' />
            </MenuItem>
            {Object.values(ESort).map((option) => (
              <MenuItem
                key={option}
                selected={tempSort === option}
                onClick={() => handleSortSelect(option)}
                sx={{ minHeight: 40 }}
              >
                <ListItemIcon sx={{ minWidth: 'auto', ml: 1, mr: 0 }}>
                  {option.includes('asc') ? (
                    <ArrowDropUpIcon />
                  ) : (
                    <ArrowDropDownIcon />
                  )}
                </ListItemIcon>
                <ListItemText primary={sortingParsed.parse(option).title} />
              </MenuItem>
            ))}
          </Box>
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Stack direction='row' spacing={1}>
              <Button
                fullWidth
                variant='outlined'
                onClick={handleCancelSort}
              >
                Cancel
              </Button>
              <Button
                fullWidth
                variant='contained'
                onClick={handleApplySort}
              >
                Apply
              </Button>
            </Stack>
          </Box>
        </Box>
      </Popover>

      {/* Filter Drawer */}
      <FilterDrawer
        open={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        filters={filters}
        onFilterChange={onFilterChange}
        onApply={onApplyFilter}
        onClear={onClearFilters}
      />

      {/* Product Grid - Hidden while searching */}
      <Grid
        container
        item
        xs={12}
        spacing={3}
        style={{
          display: 'flex',
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
    </>
  );
}
