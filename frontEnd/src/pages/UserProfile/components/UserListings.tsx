import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import ProductList, { IFilters } from 'pages/HomePage/components/ProductList';
import { convertFiltersToQueryParams, listerProductListQueryKey, useGetListerProductList } from 'pages/HomePage/queries';
import Spinner from 'components/Common/Spinner';
import { retrieve } from 'utils/cacheUtils';
import { CacheKeys } from 'utils/constants';
import { useMemo, useState } from 'react';
import { ESort } from 'pages/HomePage/constants';
import { defaultFilters } from 'pages/HomePage/HomePage';
import { Pagination } from '@mui/material';


export default function UserListings() {
  const listerId = retrieve(CacheKeys.userId, { parseJson: false });
  const [activeFilters, setActiveFilters] = useState<IFilters>(defaultFilters);
  const [currentSort, setCurrentSort] = useState<ESort | null>(null);
  const [applySort, setApplySort] = useState(false);
  const [applyFilter, setApplyFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const queryParams = useMemo(() => {
    if (!applyFilter && !applySort) {
      return { page: currentPage, limit: 20 };
    }
    return convertFiltersToQueryParams(activeFilters, currentSort, currentPage, 20);
  }, [activeFilters, applyFilter, applySort, currentPage, currentSort]);

  const queryKey = useMemo(() => ({
    ...listerProductListQueryKey(listerId, listerId),
    params: queryParams,
  }), [listerId, queryParams]);

  const {
    data: productsData,
    isLoading: productsListLoading,
  } = useGetListerProductList(listerId, listerId, queryParams, {
    queryKey,
  });

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
    <Grid item xs={12}>
      <Grid item xs={12}>
        <Typography variant='h4' gutterBottom>Listings</Typography>
      </Grid>
      <ProductList
        productsData={productsData}
        filters={activeFilters}
        activeSort={currentSort}
        onFilterChange={handleFilterChange}
        onApplyFilter={handleApplyFilter}
        onClearFilters={handleClearFilters}
        onSortChange={handleSortChange}
        onApplySort={handleApplySort}
        onClearSort={handleClearSort}
        isFiltersApplied={applyFilter}
        showEditButton
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
