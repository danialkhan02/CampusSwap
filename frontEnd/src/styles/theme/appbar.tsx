import type { Theme, Components } from '@mui/material/styles';

// ----------------------------------------------------------------------

const MuiAppBar: Components<Theme>['MuiAppBar'] = {
  /** **************************************
   * DEFAULT PROPS
   *************************************** */
  defaultProps: { color: 'transparent' },

  /** **************************************
   * STYLE
   *************************************** */
  styleOverrides: { root: { boxShadow: 'none' } },
};

// ----------------------------------------------------------------------

// eslint-disable-next-line import/prefer-default-export
export const appBar = { MuiAppBar };
