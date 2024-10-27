import type { Theme, Components } from '@mui/material/styles';
import { alpha } from '@mui/material';

// ----------------------------------------------------------------------

const MuiPaper: Components<Theme>['MuiPaper'] = {
  /** **************************************
   * DEFAULT PROPS
   *************************************** */
  defaultProps: { elevation: 0 },

  /** **************************************
   * STYLE
   *************************************** */
  styleOverrides: {
    root: { backgroundImage: 'none' },
    outlined: ({ theme }) => ({
      borderColor: alpha(theme.palette.grey[500], 0.16),
    }),
  },
};

// ----------------------------------------------------------------------

// eslint-disable-next-line import/prefer-default-export
export const paper = { MuiPaper };
