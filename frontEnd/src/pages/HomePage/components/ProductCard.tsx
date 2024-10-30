import React, { useState } from 'react';
import {
  Box, Card, CardMedia, CardContent, Typography, Button,
} from '@mui/material';
import { IProduct, productListQueryKey, useAddWatchlist } from 'pages/HomePage/queries';
import Link from '@mui/material/Link';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import { retrieve } from 'utils/cacheUtils';
import { CacheKeys } from 'utils/constants';
import { useQueryClient } from '@tanstack/react-query';
import Tooltip from '@mui/material/Tooltip';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import userImage from 'assets/avatar-25.webp';
import ListingModal from 'pages/UserProfile/components/ListingModal';
import LoadGoogleMaps from 'pages/UserProfile/components/LoadGoogleMaps';
import UpdateListingModal from 'pages/UserProfile/components/UpdateListingModal';


export default function ProductCard({
  product,
  showEditButton = false,
}: { product: IProduct, showEditButton: boolean }) {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const buyerId = retrieve(CacheKeys.userId, { parseJson: false });
  const isLiked = product.interested_buyers?.some(
    (buyer) => buyer.id === buyerId,
  );
  const addWatchlistHook = useAddWatchlist(product?.id || '', buyerId);
  const handleLikeToggle = () => {
    addWatchlistHook.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: productListQueryKey() });
      },
    });
  };

  const handleEditClick = () => {
    setModalOpen(true);
  };
  return (
    <>
      <Link href={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
        <Card sx={{
          position: 'relative',
          borderRadius: '8px',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: 6,
          },
        }}
        >
          <Box
            style={{
              padding: '8px',
              borderRadius: '8px',
            }}
          >
            <CardMedia
              component='img'
              image={product.images[0]}
              alt={product.name}
              style={{
                borderRadius: '4px', height: '254px', width: '254px', objectFit: 'contain',
              }}
            />
            {showEditButton ? (
              <Button
                variant='contained'
                onClick={(event) => {
                  event.preventDefault(); // Prevents navigation on click
                  handleEditClick();
                }}
                startIcon={<EditIcon />}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                }}
              >
                Edit Listing
              </Button>
            ) : (
              <IconButton
                onClick={(event) => {
                  event.preventDefault(); // Prevents navigation on click
                  handleLikeToggle();
                }}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  color: isLiked ? 'red' : '',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                  },
                }}
              >
                {isLiked ? <Favorite /> : <FavoriteBorder />}
              </IconButton>
            )}
          </Box>
          <CardContent>
            <Tooltip title={product.name}>
              <Typography variant='subtitle2' gutterBottom>
                {product.name.length > 28 ? `${product.name.slice(0, 28)}...` : product.name}
              </Typography>
            </Tooltip>
            <Box display='flex' alignItems='center' justifyContent='space-between'>
              <Stack direction='row' spacing={1} alignItems='center'>
                <Avatar
                  alt={product.seller?.first_name}
                  imgProps={{ referrerPolicy: 'no-referrer' }}
                  src={userImage}
                />
                <Stack direction='column' spacing={0}>
                  <Typography variant='subtitle1' color='textPrimary'>
                    {`${product.seller?.first_name} ${product.seller?.last_name[0]}.` || ''}
                  </Typography>
                  <Tooltip title={product.location.address || ''}>
                    <Typography variant='caption'>
                      {product.location.address && product.location?.address?.length > 15 ? product.location.address?.slice(0, 15) : product.location.address || ''}
                    </Typography>
                  </Tooltip>
                </Stack>
              </Stack>
              <Typography variant='subtitle1' color='textPrimary'>
                $
                {product.price % 1 === 0 ? product.price.toFixed(0) : product.price.toFixed(2)}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Link>
      {modalOpen && (
      <LoadGoogleMaps>
        <UpdateListingModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          currentListing={product}
        />
      </LoadGoogleMaps>
      )}
    </>
  );
}
