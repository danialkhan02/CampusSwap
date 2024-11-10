import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import ProductList from 'pages/HomePage/components/ProductList';
import { listerProductListQueryKey, useGetListerProductHistoryList } from 'pages/HomePage/queries';
import Spinner from 'components/Common/Spinner';
import { retrieve } from 'utils/cacheUtils';
import { CacheKeys } from 'utils/constants';


export default function UserItemHistory() {
  const userId = retrieve(CacheKeys.userId, { parseJson: false });
  const {
    data: productsData,
    isLoading: productsListLoading,
  } = useGetListerProductHistoryList(userId, {
    queryKey: listerProductListQueryKey(userId),
  });

  if (!productsData || productsListLoading || !productsData.data) {
    return <Spinner />;
  }
  return (
    <Grid item xs={12}>
      <Grid item xs={12}>
        <Typography variant='h4' gutterBottom>Item History</Typography>
      </Grid>
      <ProductList productsData={productsData} />
    </Grid>
  );
}
