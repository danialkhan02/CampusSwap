import bgImage from 'assets/userBackground.png';
import Button from '@mui/material/Button';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import ProfilePic from 'assets/avatar-25.webp';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { IUser } from 'pages/Authentication/queries';


type TProps = {
    handleOnClick?: () => void;
    user: IUser;
    sellerView?: boolean;
}

export default function ProfileBanner({ handleOnClick, user, sellerView }: TProps) {
  return (
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
      {!sellerView && (
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
      )}
      <Stack direction='row' alignItems='center' spacing={2}>
        <Avatar
          src={user?.profile_image_url || ProfilePic}
          sx={{
            width: 130,
            height: 130,
            border: '2px solid white',
          }}
        />
        <Stack>
          <Typography variant='h4' color='white'>{`${user.first_name} ${user.last_name}`}</Typography>
          <Typography variant='body2' color='white'>{user?.description || ''}</Typography>
        </Stack>
      </Stack>
    </Grid>
  );
}
