import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import ProductList, { IFilters } from 'pages/HomePage/components/ProductList';
import { listerProductListQueryKey, useGetListerProductList } from 'pages/HomePage/queries';
import Spinner from 'components/Common/Spinner';
import { retrieve } from 'utils/cacheUtils';
import { CacheKeys } from 'utils/constants';
import { useMemo, useState } from 'react';
import { convertFiltersToQueryParams, defaultFilters } from 'pages/HomePage/HomePage';


export default function UserListings() {
  const listerId = retrieve(CacheKeys.userId, { parseJson: false });
  const [activeFilters, setActiveFilters] = useState<IFilters>(defaultFilters);

  const [applyFilter, setApplyFilter] = useState(false);

  const queryParams = useMemo(() => {
    if (!applyFilter) {
      return { page: 1, limit: 20 };
    }
    return convertFiltersToQueryParams(activeFilters);
  }, [activeFilters, applyFilter]);

  const {
    data: productsData,
    isLoading: productsListLoading,
  } = useGetListerProductList(listerId, {
    queryKey: listerProductListQueryKey(listerId),
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

  if (!productsData || productsListLoading || !productsData.data) {
    return <Spinner />;
  }
  return (
    <Grid item xs={12}>
      <Grid item xs={12}>
        <Typography variant='h4' gutterBottom>Listings</Typography>
      </Grid>
      <ProductList
        productsData={productsData}
        filters={activeFilters}
        onFilterChange={handleFilterChange}
        onApplyFilter={handleApplyFilter}
        onClearFilters={handleClearFilters}
        isFiltersApplied={applyFilter}
        showEditButton
      />
    </Grid>
  );
}
