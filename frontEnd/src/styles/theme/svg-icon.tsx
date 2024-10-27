import type { Theme, Components } from '@mui/material/styles';

// ----------------------------------------------------------------------

const MuiSvgIcon: Components<Theme>['MuiSvgIcon'] = {
  /** **************************************
   * STYLE
   *************************************** */
  styleOverrides: { fontSizeLarge: { width: 32, height: 32, fontSize: 'inherit' } },
};

// ----------------------------------------------------------------------

// eslint-disable-next-line import/prefer-default-export
export const svgIcon = { MuiSvgIcon };
