import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { UserMenuTree } from 'utils/NavTree';
import { useGetUser } from 'pages/Authentication/queries';
import { retrieve } from 'utils/cacheUtils';
import { CacheKeys } from 'utils/constants';
import userImage from 'assets/avatar-25.webp';
import { ListItemText } from '@mui/material';
import Stack from '@mui/material/Stack';


export default function UserSettings() {
  const userId = retrieve(CacheKeys.userId, { parseJson: false });
  const { data: userData } = useGetUser(userId);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Tooltip title='Open settings'>
      <>
        <IconButton sx={{ p: 0 }} onClick={handleClick}>
          <Avatar
            alt={userData?.data.first_name}
            imgProps={{ referrerPolicy: 'no-referrer' }}
            src={userData?.data.profile_image_url || userImage}
          />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          sx={{
            textTransform: 'none',
          }}
        >
          {UserMenuTree.map((item) => {
            const { Icon } = item;
            return (
              <MenuItem key={item.name}>
                <Link color='inherit' component={RouterLink} to={item.spaUrl} underline='none'>
                  <Stack direction='row'>
                    <ListItemIcon sx={{ mr: 0 }}><Icon fontSize='small' /></ListItemIcon>
                    <ListItemText>{item.name}</ListItemText>
                  </Stack>
                </Link>
              </MenuItem>
            );
          })}
        </Menu>
      </>
    </Tooltip>
  );
}
