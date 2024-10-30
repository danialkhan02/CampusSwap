import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import ProductList from 'pages/HomePage/components/ProductList';
import {
  listerProductListQueryKey,
  useGetListerProductList,
} from 'pages/HomePage/queries';
import Spinner from 'components/Common/Spinner';
import { retrieve } from 'utils/cacheUtils';
import { CacheKeys } from 'utils/constants';


export default function UserListings() {
  const listerId = retrieve(CacheKeys.userId, { parseJson: false });
  const {
    data: productsData,
    isLoading: productsListLoading,
  } = useGetListerProductList(listerId, {
    queryKey: listerProductListQueryKey(listerId),
  });

  if (!productsData || productsListLoading || !productsData.data) {
    return <Spinner />;
  }
  return (
    <Grid item xs={12}>
      <Grid item xs={12}>
        <Typography variant='h4' gutterBottom>Listings</Typography>
      </Grid>
      <ProductList productsData={productsData} showEditButton />
    </Grid>
  );
}
