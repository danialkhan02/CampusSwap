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
import { useGetUser } from 'pages/Authentication/queries';
import { retrieve } from 'utils/cacheUtils';
import { CacheKeys } from 'utils/constants';
import Spinner from 'components/Common/Spinner';
import ProfileCard from 'pages/UserProfile/components/ProfileCard';
import ProfileBanner from 'pages/UserProfile/components/ProfileBanner';


export default function UserProfile() {
  const userId = retrieve(CacheKeys.userId, { parseJson: false });
  const [selectedTab, setSelectedTab] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const {
    data: userData,
    isLoading,
  } = useGetUser(userId);

  if (!userData || isLoading || !userData.data) {
    return <Spinner />;
  }

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
            <ProfileBanner handleOnClick={handleOnClick} user={userData.data} />
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
      {selectedTab === 0 && (
        <ProfileCard profile={userData.data} />
      )}
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
