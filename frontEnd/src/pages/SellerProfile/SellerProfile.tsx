import { Card, Tab, Tabs } from '@mui/material';
import Grid from '@mui/material/Grid';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import CollectionsIcon from '@mui/icons-material/Collections';
import ReviewsIcon from '@mui/icons-material/Reviews';
import Box from '@mui/material/Box';
import { useState } from 'react';
import LoadGoogleMaps from 'pages/UserProfile/components/LoadGoogleMaps';
import UserListings from 'pages/UserProfile/components/UserListings';
import ListingModal from 'pages/UserProfile/components/ListingModal';
import { useGetUser, userQueryKey } from 'pages/Authentication/queries';
import Spinner from 'components/Common/Spinner';
import ProfileCard from 'pages/UserProfile/components/ProfileCard';
import ProfileBanner from 'pages/UserProfile/components/ProfileBanner';
import { useParams } from 'react-router-dom';


export default function SellerProfile() {
  const { sellerId } = useParams<{ sellerId: string }>();
  const [selectedTab, setSelectedTab] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const {
    data: userData,
    isLoading,
  } = useGetUser(sellerId || '', {
    queryKey: userQueryKey(sellerId || ''),
    enabled: Boolean(sellerId),
  });

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
            <ProfileBanner handleOnClick={handleOnClick} user={userData.data} sellerView />
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
                  <Tab icon={<ReviewsIcon />} label='Reviews' />
                  <Tab icon={<CollectionsIcon />} label='Listings' />
                </Tabs>
              </Box>
            </Grid>
          </Grid>
        </Card>
      </Grid>
      {selectedTab === 0 && (
        <ProfileCard profile={userData.data} sellerView />
      )}
      {selectedTab === 2 && (
        <UserListings listerId={sellerId || ''} />
      )}
      {modalOpen && (
        <LoadGoogleMaps>
          <ListingModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
        </LoadGoogleMaps>
      )}
    </Grid>
  );
}
