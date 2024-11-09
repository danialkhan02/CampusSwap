import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Spinner from 'components/Common/Spinner';
import ProductList, { IFilters } from 'pages/HomePage/components/ProductList';
import { productListQueryKey, useGetProductList } from 'pages/HomePage/queries';
import { useMemo, useState } from 'react';
import { ESort } from 'pages/HomePage/constants';
import { convertFiltersToQueryParams, defaultFilters } from 'pages/HomePage/utils';


export default function HomePage() {
  const [activeFilters, setActiveFilters] = useState<IFilters>(defaultFilters);
  const [currentSort, setCurrentSort] = useState<ESort | null>(null);
  const [applySort, setApplySort] = useState(false);
  const [applyFilter, setApplyFilter] = useState(false);

  // Convert filters to query params only when applyFilter is true
  const queryParams = useMemo(() => {
    if (!applyFilter && !applySort) {
      return { page: 1, limit: 20 };
    }
    return convertFiltersToQueryParams(activeFilters, currentSort);
  }, [activeFilters, applyFilter, applySort, currentSort]);

  const { data: productsData, isLoading: productsListLoading } = useGetProductList(
    queryParams,
    {
      queryKey: productListQueryKey(),
    },
  );

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
    </Grid>
  );
}
