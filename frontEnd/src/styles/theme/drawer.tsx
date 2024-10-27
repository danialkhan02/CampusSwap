import type { Theme, Components } from '@mui/material/styles';
import { alpha } from '@mui/material';
import { paper } from 'styles/theme/utils';

// ----------------------------------------------------------------------

const MuiDrawer: Components<Theme>['MuiDrawer'] = {
  /** **************************************
   * STYLE
   *************************************** */
  styleOverrides: {
    paperAnchorRight: ({ ownerState, theme }) => ({
      ...(ownerState.variant === 'temporary' && {
        ...paper({ theme }),
        boxShadow: `-40px 40px 80px -8px ${alpha(theme.palette.grey[500], 0.24)}`,
      }),
    }),
    paperAnchorLeft: ({ ownerState, theme }) => ({
      ...(ownerState.variant === 'temporary' && {
        ...paper({ theme }),
        boxShadow: `40px 40px 80px -8px ${alpha(theme.palette.grey[500], 0.24)}`,
      }),
    }),
  },
};

// ----------------------------------------------------------------------

// eslint-disable-next-line import/prefer-default-export
export const drawer = { MuiDrawer };
