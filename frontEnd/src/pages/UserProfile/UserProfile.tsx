import {
  Card, Tab, Tabs,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import ProfilePic from 'assets/avatar-25.webp';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CollectionsIcon from '@mui/icons-material/Collections';
import ReviewsIcon from '@mui/icons-material/Reviews';
import bgImage from 'assets/userBackground.png';
import Box from '@mui/material/Box';
import { useState } from 'react';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import Button from '@mui/material/Button';
import ListingModal from 'pages/UserProfile/components/ListingModal';
import LoadGoogleMaps from 'pages/UserProfile/components/LoadGoogleMaps';
import UserListings from 'pages/UserProfile/components/UserListings';
import UserWishlist from 'pages/UserProfile/components/UserWishlist';


export default function UserProfile() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const handleTabChange = (event: React.SyntheticEvent<Element, Event>, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleOnClick = () => {
    setModalOpen(true);
  };


  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Card sx={{
          borderRadius: 2, overflow: 'hidden', color: 'white',
        }}
        >
          <Grid container>
            <Grid
              item
              xs={12}
              sx={{
                p: 2,
                position: 'relative',
                backgroundImage: `linear-gradient(rgba(0, 75, 80, 0.7), rgba(0, 75, 80, 0.7)), url(${bgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <Button
                startIcon={<AddCircleIcon />}
                onClick={handleOnClick}
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  backgroundColor: 'white',
                  color: 'black',
                  '&:hover': {
                    backgroundColor: '#f0f0f0',
                  },
                }}
                aria-label='create'
                variant='contained'
              >
                Create Listing
              </Button>
              <Stack direction='row' alignItems='center' spacing={2}>
                <Avatar
                  src={ProfilePic}
                  sx={{
                    width: 130,
                    height: 130,
                    border: '2px solid white',
                  }}
                />
                <Stack>
                  <Typography variant='h4'>Myles Johnson</Typography>
                  <Typography variant='body2'>I am a second-year student studying math.</Typography>
                </Stack>
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', pr: 2 }}>
                <Tabs
                  value={selectedTab}
                  onChange={handleTabChange}
                  TabIndicatorProps={{
                    sx: {
                      backgroundColor: 'text.primary',
                      height: 2,
                    },
                  }}
                  sx={{
                    '& .MuiTabs-indicator': {
                      backgroundColor: 'text.primary',
                    },
                  }}
                >
                  <Tab icon={<AccountBoxIcon />} label='Profile' />
                  <Tab icon={<FavoriteIcon />} label='Wishlist' />
                  <Tab icon={<ReviewsIcon />} label='Reviews' />
                  <Tab icon={<CollectionsIcon />} label='Listings' />
                </Tabs>
              </Box>
            </Grid>
          </Grid>
        </Card>
      </Grid>
      {selectedTab === 1 && (
        <UserWishlist />
      )}
      {selectedTab === 3 && (
      <UserListings />
      )}
      {modalOpen && (
      <LoadGoogleMaps>
        <ListingModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      </LoadGoogleMaps>
      )}
    </Grid>
  );
}
