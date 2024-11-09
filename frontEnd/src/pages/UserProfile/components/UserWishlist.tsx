import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import ProductList, { IFilters } from 'pages/HomePage/components/ProductList';
import { convertFiltersToQueryParams, listerProductListQueryKey, useGetListerWishList } from 'pages/HomePage/queries';
import Spinner from 'components/Common/Spinner';
import { retrieve } from 'utils/cacheUtils';
import { CacheKeys } from 'utils/constants';
import { useMemo, useState } from 'react';
import { ESort } from 'pages/HomePage/constants';
import { defaultFilters } from 'pages/HomePage/HomePage';


export default function UserWishlist() {
  const userId = retrieve(CacheKeys.userId, { parseJson: false });
  const [activeFilters, setActiveFilters] = useState<IFilters>(defaultFilters);
  const [currentSort, setCurrentSort] = useState<ESort | null>(null);
  const [applySort, setApplySort] = useState(false);
  const [applyFilter, setApplyFilter] = useState(false);

  const queryParams = useMemo(() => {
    if (!applyFilter && !applySort) {
      return { page: 1, limit: 20 };
    }
    return convertFiltersToQueryParams(activeFilters, currentSort);
  }, [activeFilters, applyFilter, applySort, currentSort]);

  const queryKey = useMemo(() => ({
    ...listerProductListQueryKey(userId),
    params: queryParams,
  }), [userId, queryParams]);

  const {
    data: productsData,
    isLoading: productsListLoading,
  } = useGetListerWishList(userId, queryParams, {
    queryKey,
  });

  const handleFilterChange = (newFilters: IFilters) => {
    setActiveFilters(newFilters);
    setApplyFilter(false);
  };

  const handleApplyFilter = () => {
    setApplyFilter(true);
  };

  const handleClearFilters = () => {
    setActiveFilters(defaultFilters);
    setApplyFilter(false);
  };

  const handleSortChange = (newSort: ESort) => {
    setCurrentSort(newSort);
    setApplySort(false);
  };

  const handleApplySort = () => {
    setApplySort(true);
  };

  const handleClearSort = () => {
    setCurrentSort(null);
    setApplySort(false);
  };

  if (!productsData || productsListLoading || !productsData.data) {
    return <Spinner />;
  }
  return (
    <Grid item xs={12}>
      <Grid item xs={12}>
        <Typography variant='h4' gutterBottom>Wishlist</Typography>
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
    </Grid>
  );
}
