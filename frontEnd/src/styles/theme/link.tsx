import type { Theme, Components } from '@mui/material/styles';

// ----------------------------------------------------------------------

const MuiLink: Components<Theme>['MuiLink'] = {
  /** **************************************
   * DEFAULT PROPS
   *************************************** */
  defaultProps: { underline: 'hover' },

  /** **************************************
   * STYLE
   *************************************** */
  styleOverrides: {},
};

// ----------------------------------------------------------------------

// eslint-disable-next-line import/prefer-default-export
export const link = { MuiLink };
