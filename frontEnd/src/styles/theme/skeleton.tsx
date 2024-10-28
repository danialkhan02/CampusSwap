import type { Theme, Components } from '@mui/material/styles';
import { alpha } from '@mui/material';


// ----------------------------------------------------------------------

const MuiSkeleton: Components<Theme>['MuiSkeleton'] = {
  /** **************************************
   * DEFAULT PROPS
   *************************************** */
  defaultProps: { animation: 'wave', variant: 'rounded' },

  /** **************************************
   * STYLE
   *************************************** */
  styleOverrides: {
    root: ({ theme }) => ({
      backgroundColor: alpha(theme.palette.grey[400], 0.12),
    }),
    rounded: ({ theme }) => ({ borderRadius: theme.shape.borderRadius * 2 }),
  },
};

// ----------------------------------------------------------------------

// eslint-disable-next-line import/prefer-default-export
export const skeleton = { MuiSkeleton };
