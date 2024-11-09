import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Spinner from 'components/Common/Spinner';
import ProductList, { IFilters } from 'pages/HomePage/components/ProductList';
import { IProductListQueryParams, productListQueryKey, useGetProductList } from 'pages/HomePage/queries';
import { useMemo, useState } from 'react';
import { ECondition } from 'pages/HomePage/constants';


export const convertFiltersToQueryParams = (filters: IFilters): IProductListQueryParams => {
  // Check conditions - if both are true or both are false, don't include condition
  const conditionNew = filters.condition[ECondition.CONDITION_NEW];
  const conditionUsed = filters.condition[ECondition.CONDITION_USED];
  let conditionParam: ECondition | undefined;

  if (conditionNew !== conditionUsed) { // Only if one is true and the other is false
    conditionParam = conditionNew ? ECondition.CONDITION_NEW : ECondition.CONDITION_USED;
  }

  return {
    page: 1,
    limit: 20,
    category: filters.category ?? undefined,
    condition: conditionParam,
    price_min: filters.price[0],
    price_max: filters.price[1],
    latitude: filters.location.latitude || undefined,
    longitude: filters.location.longitude || undefined,
    radius: filters.location.latitude === 0 ? undefined : filters.radius,
  };
};

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
  const [activeFilters, setActiveFilters] = useState<IFilters>(defaultFilters);

  const [applyFilter, setApplyFilter] = useState(false);

  // Convert filters to query params only when applyFilter is true
  const queryParams = useMemo(() => {
    if (!applyFilter) {
      return { page: 1, limit: 20 };
    }
    return convertFiltersToQueryParams(activeFilters);
  }, [activeFilters, applyFilter]);

  const { data: productsData, isLoading: productsListLoading } = useGetProductList(
    queryParams,
    {
      queryKey: productListQueryKey(JSON.stringify(queryParams)),
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
        isFiltersApplied={applyFilter}
      />
    </Grid>
  );
}
