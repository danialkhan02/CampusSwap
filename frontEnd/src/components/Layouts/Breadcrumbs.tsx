import React from 'react';
import {
  Box, Breadcrumbs as MuiBreadcrumbs, Link, Typography, useTheme,
} from '@mui/material';
import {
  Home as HomeIcon,
  Inventory as ProductIcon,
  NavigateNext as NavigateNextIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { Link as RouterLink, useLocation } from 'react-router-dom';


function Breadcrumbs() {
  const location = useLocation();
  const theme = useTheme();

  const getBreadcrumbs = () => {
    const path = location.pathname;

    // Default breadcrumb (Home)
    const baseCrumb = {
      label: 'Home',
      href: '/',
      icon: HomeIcon,
    };

    if (path.includes('/product/')) {
      return [
        baseCrumb,
        {
          label: 'Product Details',
          href: path,
          icon: ProductIcon,
        },
      ];
    }
    else if (path.includes('/profile')) {
      return [
        baseCrumb,
        {
          label: 'User Profile',
          href: path,
          icon: SettingsIcon,
        },
      ];
    }

    return [baseCrumb];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        py: 2,
      }}
    >
      <MuiBreadcrumbs
        separator={<NavigateNextIcon fontSize='small' />}
        aria-label='breadcrumb'
      >
        {breadcrumbs.map((crumb, index) => {
          const Icon = crumb.icon;
          const isLast = index === breadcrumbs.length - 1;

          return isLast ? (
            <Typography
              key={crumb.href}
              sx={{
                display: 'flex',
                alignItems: 'center',
                color: 'text.primary',
                fontWeight: 'medium',
              }}
            >
              <Icon
                sx={{
                  mr: 0.5,
                  fontSize: 20,
                  color: theme.palette.primary.main,
                }}
              />
              {crumb.label}
            </Typography>
          ) : (
            <Link
              key={crumb.href}
              component={RouterLink}
              to={crumb.href}
              sx={{
                display: 'flex',
                alignItems: 'center',
                color: 'text.secondary',
                textDecoration: 'none',
                '&:hover': {
                  color: 'primary.main',
                  textDecoration: 'underline',
                },
              }}
            >
              <Icon
                sx={{
                  mr: 0.5,
                  fontSize: 20,
                  color: 'inherit',
                }}
              />
              {crumb.label}
            </Link>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
}

export default Breadcrumbs;
