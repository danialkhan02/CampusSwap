import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { productListQueryKey, useGetProductList } from 'pages/HomePage/queries';
import Spinner from 'components/Common/Spinner';
import ProductList from 'pages/HomePage/components/ProductList';


export default function HomePage() {
  const {
    data: productsData,
    isLoading: productsListLoading,
  } = useGetProductList({
    queryKey: productListQueryKey(),
  });

  if (!productsData || productsListLoading || !productsData.data) {
    return <Spinner />;
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant='h4' gutterBottom>Shop</Typography>
      </Grid>
      <ProductList productsData={productsData} />
    </Grid>
  );
}
