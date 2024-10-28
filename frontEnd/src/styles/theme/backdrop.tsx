import type { Theme, Components } from '@mui/material/styles';
import { alpha } from '@mui/material';

// ----------------------------------------------------------------------

const MuiBackdrop: Components<Theme>['MuiBackdrop'] = {
  /** **************************************
   * STYLE
   *************************************** */
  styleOverrides: {
    root: ({ theme }) => ({
      backgroundColor: alpha(theme.palette.grey[800], 0.48),
    }),
    invisible: { background: 'transparent' },
  },
};

// ----------------------------------------------------------------------

// eslint-disable-next-line import/prefer-default-export
export const backdrop = { MuiBackdrop };
