import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Spinner from 'components/Common/Spinner';
import ProductList, { IFilters } from 'pages/HomePage/components/ProductList';
import { convertFiltersToQueryParams, productListQueryKey, useGetProductList } from 'pages/HomePage/queries';
import { useMemo, useState } from 'react';
import { ECondition, ESort } from 'pages/HomePage/constants';
import { Pagination } from '@mui/material';
import { retrieve } from 'utils/cacheUtils';
import { CacheKeys } from 'utils/constants';


export const defaultFilters: IFilters = {
  condition: {
    [ECondition.CONDITION_NEW]: false,
    [ECondition.CONDITION_USED]: false,
  },
  location: {
    address: '',
    latitude: 0,
    longitude: 0,
  },
  radius: 250,
  category: null,
  price: [0, 200],
  seller_rating: 0,
};


export default function HomePage() {
  const userId = retrieve(CacheKeys.userId, { parseJson: false });
  const [activeFilters, setActiveFilters] = useState<IFilters>(defaultFilters);
  const [currentSort, setCurrentSort] = useState<ESort | null>(null);
  const [applySort, setApplySort] = useState(false);
  const [applyFilter, setApplyFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Convert filters to query params only when applyFilter is true
  const queryParams = useMemo(() => {
    if (!applyFilter && !applySort) {
      return { page: currentPage, limit: 20 };
    }
    return convertFiltersToQueryParams(activeFilters, currentSort, currentPage, 20);
  }, [activeFilters, applyFilter, applySort, currentPage, currentSort]);

  const queryKey = useMemo(() => ({
    ...productListQueryKey(userId),
    params: queryParams,
  }), [queryParams, userId]);

  const { data: productsData, isLoading: productsListLoading } = useGetProductList(
    userId,
    queryParams,
    {
      queryKey,
    },
  );

  const handleFilterChange = (newFilters: IFilters) => {
    setActiveFilters(newFilters);
    setApplyFilter(false);
    setCurrentPage(1);
  };

  const handleApplyFilter = () => {
    setApplyFilter(true);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setActiveFilters(defaultFilters);
    setApplyFilter(false);
    setCurrentPage(1);
  };

  const handleSortChange = (newSort: ESort) => {
    setCurrentSort(newSort);
    setApplySort(false);
    setCurrentPage(1);
  };

  const handleApplySort = () => {
    setApplySort(true);
    setCurrentPage(1);
  };

  const handleClearSort = () => {
    setCurrentSort(null);
    setApplySort(false);
    setCurrentPage(1);
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  if (!productsData || productsListLoading || !productsData.data) {
    return <Spinner />;
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant='h4' gutterBottom>
          Shop
        </Typography>
      </Grid>
      <ProductList
        productsData={productsData}
        filters={activeFilters}
        onFilterChange={handleFilterChange}
        onApplyFilter={handleApplyFilter}
        onClearFilters={handleClearFilters}
        onSortChange={handleSortChange}
        onApplySort={handleApplySort}
        onClearSort={handleClearSort}
        isFiltersApplied={applyFilter}
        activeSort={currentSort}
      />
      {Math.ceil(productsData.data.total / productsData.data.limit) > 1 && (
      <Grid item xs={12} display='flex' justifyContent='center' mt={4}>
        <Pagination
          count={Math.ceil(productsData.data.total / productsData.data.limit)}
          page={currentPage}
          onChange={handlePageChange}
          color='primary'
          size='large'
          showFirstButton
          showLastButton
        />
      </Grid>
      )}
    </Grid>
  );
}
