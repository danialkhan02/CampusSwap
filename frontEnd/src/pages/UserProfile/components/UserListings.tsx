import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import ProductList from 'pages/HomePage/components/ProductList';
import {
  convertFiltersToQueryParams,
  IFilters,
  listerProductListQueryKey,
  useGetListerProductList,
  IProductListQueryParams,
} from 'pages/HomePage/queries';
import Spinner from 'components/Common/Spinner';
import { retrieve } from 'utils/cacheUtils';
import { CacheKeys } from 'utils/constants';
import { useMemo, useState, useCallback } from 'react';
import { ESort } from 'pages/HomePage/constants';
import { defaultFilters, useBreakpointLimit } from 'pages/HomePage/HomePage';
import { Pagination } from '@mui/material';
import type { RefetchOptions } from '@tanstack/react-query';


type ExtendedQueryParams = IProductListQueryParams & RefetchOptions & {
  page: number;
  limit: number;
};

export default function UserListings() {
  const listerId = retrieve(CacheKeys.userId, { parseJson: false });
  const [activeFilters, setActiveFilters] = useState<IFilters>(defaultFilters);
  const [currentSort, setCurrentSort] = useState<ESort | null>(null);
  const [searchKeyword, setSearchKeyWord] = useState('');
  const [applySearch, setApplySearch] = useState(false);
  const [applySort, setApplySort] = useState(false);
  const [applyFilter, setApplyFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const currentLimit = useBreakpointLimit();

  const queryParams: ExtendedQueryParams = useMemo(() => {
    if (!applyFilter && !applySort && !applySearch) {
      return { page: currentPage, limit: currentLimit };
    }
    return convertFiltersToQueryParams(
      activeFilters,
      currentSort,
      currentPage,
      currentLimit,
      applySearch ? searchKeyword : '',
    );
  }, [
    activeFilters,
    applyFilter,
    applySearch,
    applySort,
    currentLimit,
    currentPage,
    currentSort,
    searchKeyword,
  ]);

  const queryKey = useMemo(
    () => ({
      ...listerProductListQueryKey(listerId, listerId),
      params: queryParams,
    }),
    [listerId, queryParams],
  );

  const {
    data: productsData,
    isLoading: productsListLoading,
    error,
    isError,
    refetch,
  } = useGetListerProductList(listerId, listerId, queryParams, {
    queryKey,
  });

  const handleRefetch = useCallback(
    async (params: ExtendedQueryParams) => {
      await refetch(params);
    },
    [refetch],
  );

  const handleFilterChange = useCallback(
    async (newFilters: IFilters) => {
      setActiveFilters(newFilters);
      setApplyFilter(false);
      await handleRefetch({ ...queryParams, page: 1 });
    },
    [queryParams, handleRefetch],
  );

  const handleApplyFilter = useCallback(async () => {
    setApplyFilter(true);
    await handleRefetch({ ...queryParams, page: 1 });
  }, [queryParams, handleRefetch]);

  const handleClearFilters = useCallback(async () => {
    setActiveFilters(defaultFilters);
    setApplyFilter(false);
    await handleRefetch({ ...queryParams, page: 1 });
  }, [queryParams, handleRefetch]);

  const handleSortChange = useCallback(
    async (newSort: ESort) => {
      setCurrentSort(newSort);
      setApplySort(false);
      await handleRefetch({ ...queryParams, page: 1 });
    },
    [queryParams, handleRefetch],
  );

  const handleApplySort = useCallback(async () => {
    setApplySort(true);
    await handleRefetch({ ...queryParams, page: 1 });
  }, [queryParams, handleRefetch]);

  const handleClearSort = useCallback(async () => {
    setCurrentSort(null);
    setApplySort(false);
    await handleRefetch({ ...queryParams, page: 1 });
  }, [queryParams, handleRefetch]);

  const handleSearchChange = useCallback(
    async (newSearch: string) => {
      setSearchKeyWord(newSearch);
      setApplySearch(false);
      await handleRefetch({ ...queryParams, page: 1 });
    },
    [queryParams, handleRefetch],
  );

  const handleApplySearch = useCallback(async () => {
    setApplySearch(true);
    await handleRefetch({ ...queryParams, page: 1 });
  }, [queryParams, handleRefetch]);

  const handlePageChange = useCallback(
    async (_event: React.ChangeEvent<unknown>, page: number) => {
      setCurrentPage(page);
      await handleRefetch({ ...queryParams, page });
    },
    [queryParams, handleRefetch],
  );

  if (productsListLoading) {
    return <Spinner />;
  }

  if (isError && error) {
    return <Alert severity='error'>Failed to load listings</Alert>;
  }

  if (!productsData?.data) {
    return null;
  }

  const paginationCount = Math.ceil(
    productsData.data.total / productsData.data.limit,
  );

  return (
    <Grid item xs={12}>
      <Grid item xs={12}>
        <Typography variant='h4' gutterBottom>
          Listings
        </Typography>
      </Grid>
      <ProductList
        productsData={productsData}
        filters={activeFilters}
        activeSort={currentSort}
        currentSearch={searchKeyword}
        onFilterChange={handleFilterChange}
        onApplyFilter={handleApplyFilter}
        onClearFilters={handleClearFilters}
        onSortChange={handleSortChange}
        onApplySort={handleApplySort}
        onClearSort={handleClearSort}
        onSearchChange={handleSearchChange}
        onApplySearch={handleApplySearch}
        isFiltersApplied={applyFilter}
        showEditButton
      />
      {paginationCount > 1 && (
        <Grid item xs={12} display='flex' justifyContent='center' mt={4}>
          <Pagination
            count={paginationCount}
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
