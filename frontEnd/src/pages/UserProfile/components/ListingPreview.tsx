import React, { useRef, useEffect, useState } from 'react';
import { GoogleMap } from '@react-google-maps/api';
import { IProduct } from 'pages/HomePage/queries';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import { AddShoppingCart, Chat } from '@mui/icons-material';
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';
import { retrieve } from 'utils/cacheUtils';
import { CacheKeys } from 'utils/constants';


type TProps = {
  listing: IProduct;
  onWatchListClick?: () => void;
  onMessageButtonClick?: () => void;
};

const mapContainerStyle = {
  width: '100%',
  height: '300px',
};

export default function ListingPreview({
  listing,
  onWatchListClick, onMessageButtonClick,
}: TProps) {
  const buyerId = retrieve(CacheKeys.userId, { parseJson: false });
  const isLiked = listing.interested_buyers?.some(
    (buyer) => buyer.id === buyerId,
  );
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement
      | google.maps.Marker | null>(null);
  const [mainImage, setMainImage] = useState(listing.images[0] || ''); // State for the main image

  const lat = listing.location.latitude || 0;
  const lng = listing.location.longitude || 0;

  const initializeMarker = () => {
    if (mapRef.current && window.google) {
      // Clear existing marker if it's a standard google.maps.Marker
      if (markerRef.current instanceof google.maps.Marker) {
        markerRef.current.setMap(null);
      }

      const { marker } = window.google.maps;
      markerRef.current = marker?.AdvancedMarkerElement
        ? new marker.AdvancedMarkerElement({
          map: mapRef.current,
          position: { lat, lng },
          title: listing.name,
        })
        : new google.maps.Marker({
          map: mapRef.current,
          position: { lat, lng },
          title: listing.name,
        });
    }
  };

  const handleMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    initializeMarker();
  };

  useEffect(() => {
    initializeMarker();
  }, [lat, lng]);

  useEffect(() => {
    if (listing.images.length > 0) {
      setMainImage(listing.images[0]);
    }
    else {
      setMainImage('');
    }
  }, [listing.images]);

  const handleAvatarClick = (image: string) => {
    setMainImage(image);
  };

  return (
    <Grid container spacing={4} padding={4}>
      <Grid item xs={12} md={6}>
        <Box>
          <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
            {mainImage ? (
              <CardMedia
                component='img'
                image={mainImage}
                alt='Product'
                sx={{
                  width: '100%',
                  height: '100%',
                  maxHeight: '300px',
                  maxWidth: '100%',
                  objectFit: 'contain',
                }}
              />
            ) : (
              <Box
                display='flex'
                alignItems='center'
                justifyContent='center'
                height='100%'
                bgcolor='#f0f0f0'
                color='#888'
                fontSize='1.5rem'
                sx={{ height: '300px' }}
              >
                Your Image Here
              </Box>
            )}
          </Card>
          <Box display='flex' justifyContent='center' mt={2}>
            {listing.images.length > 0 ? (
              listing.images.map((thumb, index) => (
                <Avatar
                  key={`avatar-${thumb.slice(0, 10)}`}
                  src={thumb}
                  variant='square'
                  sx={{
                    width: 40,
                    height: 40,
                    border: '2px solid #f0f0f0',
                    borderRadius: '8px',
                    marginRight: 1,
                    cursor: 'pointer',
                  }}
                  onClick={() => handleAvatarClick(thumb)}
                />
              ))
            ) : (
              <Typography variant='body2' color='textSecondary'>
                No images available
              </Typography>
            )}
          </Box>
        </Box>
      </Grid>

      {/* Right Section - Product Details */}
      <Grid item xs={12} md={6}>
        <Box display='flex' flexDirection='column' gap={2}>
          <Typography variant='h4'>{listing.name}</Typography>
          <Box display='flex' gap={1} alignItems='center'>
            <Chip
              label={`Condition: ${listing.condition}`}
              variant='filled'
              sx={{
                opacity: '60%',
                backgroundColor: '#FF950026',
                color: 'black',
                height: '25px',
                fontSize: '12px',
              }}
            />
          </Box>
          <Box display='flex' gap={1} alignItems='center'>
            <Stack direction='row' spacing={1}>
              <Typography variant='body2'>Tags: </Typography>
              <Chip
                label={`Category: ${listing.category}`}
                color='primary'
                variant='filled'
                sx={{
                  height: '25px',
                  fontSize: '12px',
                }}
              />
            </Stack>
          </Box>
          <Box display='flex' gap={1} alignItems='center'>
            <Typography variant='h5' color='error'>
              $
              {listing.price % 1 === 0 ? listing.price.toFixed(0) : listing.price.toFixed(2)}
            </Typography>
          </Box>
          <Typography variant='body2' color='textSecondary'>
            {listing.description}
          </Typography>
          <Divider />
          {/* Action Buttons */}
          <Box display='flex' gap={2}>
            <Button
              variant='contained'
              size='small'
              onClick={onWatchListClick}
              startIcon={isLiked ? <RemoveShoppingCartIcon /> : <AddShoppingCart />}
              sx={{ backgroundColor: isLiked ? '#D32F2F' : '#FFA500', color: 'white', flex: 1 }}
            >
              {isLiked ? 'Remove from WishList' : 'Add to WishList'}
            </Button>
            <Button
              variant='contained'
              size='small'
              onClick={onMessageButtonClick}
              startIcon={<Chat />}
              sx={{ backgroundColor: 'black', color: 'white', flex: 1 }}
            >
              Message Seller
            </Button>
          </Box>
        </Box>
      </Grid>

      {/* Map Section */}
      <Grid item xs={12}>
        <Box mt={1}>
          <Typography variant='h6'>
            Location:
            {' '}
            {listing.location.address}
          </Typography>
          <GoogleMap
            onLoad={handleMapLoad}
            mapContainerStyle={mapContainerStyle}
            center={{ lat, lng }}
            zoom={12}
          />
        </Box>
      </Grid>
    </Grid>
  );
}
