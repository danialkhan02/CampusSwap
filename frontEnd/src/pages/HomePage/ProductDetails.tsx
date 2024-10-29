import { useNavigate, useParams } from 'react-router-dom';
import Spinner from 'components/Common/Spinner';
import Grid from '@mui/material/Grid';
import ProductHeader from 'pages/HomePage/components/ProductHeader';
import { productDetailsQueryKey, useGetProductDetails } from 'pages/HomePage/queries';


export default function ProductDetails() {
  const { productId } = useParams<{ productId: string }>();
  const {
    data: productData,
    isLoading,
  } = useGetProductDetails(productId || '', {
    queryKey: productDetailsQueryKey(productId || ''),
    enabled: Boolean(productId),
  });

  if (!productData || isLoading || !productData?.data) {
    return <Spinner />;
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <ProductHeader title={productData.data.name} />
      </Grid>
    </Grid>
  );
}
