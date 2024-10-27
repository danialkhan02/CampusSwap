import type { Theme, Components } from '@mui/material/styles';

// ----------------------------------------------------------------------

const MuiStack: Components<Theme>['MuiStack'] = {
  /** **************************************
   * DEFAULT PROPS
   *************************************** */
  defaultProps: { useFlexGap: true },
  /** **************************************
   * STYLE
   *************************************** */
  styleOverrides: {},
};

// ----------------------------------------------------------------------

// eslint-disable-next-line import/prefer-default-export
export const stack = { MuiStack };
