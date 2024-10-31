import { useNavigate, useParams } from 'react-router-dom';
import Spinner from 'components/Common/Spinner';
import Grid from '@mui/material/Grid';
import ProductHeader from 'pages/HomePage/components/ProductHeader';
import {
  productDetailsQueryKey,
  useAddWatchlist,
  useGetProductDetails,
} from 'pages/HomePage/queries';
import ListingPreview from 'pages/UserProfile/components/ListingPreview';
import LoadGoogleMaps from 'pages/UserProfile/components/LoadGoogleMaps';
import { retrieve } from 'utils/cacheUtils';
import { CacheKeys } from 'utils/constants';
import { useQueryClient } from '@tanstack/react-query';
import ChatWindow from 'pages/Chats/ChatWindow';
import { useState } from 'react';


export default function ProductDetails() {
  const queryClient = useQueryClient();
  const [messageButtonClick, setMessageButtonClick] = useState(false);
  const { productId } = useParams<{ productId: string }>();
  const buyerId = retrieve(CacheKeys.userId, { parseJson: false });
  const {
    data: productData,
    isLoading,
  } = useGetProductDetails(productId || '', {
    queryKey: productDetailsQueryKey(productId || ''),
    enabled: Boolean(productId),
  });
  const addWatchlistHook = useAddWatchlist(productData?.data?.id || '', buyerId);
  const navigate = useNavigate();

  if (!productData || isLoading || !productData?.data) {
    return <Spinner />;
  }
  const handleLikeToggle = () => {
    addWatchlistHook.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: productDetailsQueryKey(productData.data.id || '') });
      },
    });
  };

  const handleMessageSeller = (sellerId: string) => {
    navigate('/chats', { state: { selectedUserId: sellerId } });
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <ProductHeader title={productData.data.name} />
      </Grid>
      <Grid item xs={12}>
        <LoadGoogleMaps>
          <ListingPreview
            listing={productData.data}
            onWatchListClick={handleLikeToggle}
            onMessageButtonClick={() => handleMessageSeller(productData.data.seller?.id || '')}
          />
        </LoadGoogleMaps>
      </Grid>
      {messageButtonClick && (
      <ChatWindow receiverId={productData.data.seller?.id || ''} receiverName={productData.data.seller?.first_name || 'Unknown'} />
      )}
    </Grid>
  );
}
