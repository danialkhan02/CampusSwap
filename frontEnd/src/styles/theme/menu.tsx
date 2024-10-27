import type { Theme, Components } from '@mui/material/styles';
import { menuItem } from 'styles/theme/utils';


// ----------------------------------------------------------------------

const MuiMenuItem: Components<Theme>['MuiMenuItem'] = {
  /** **************************************
   * STYLE
   *************************************** */
  styleOverrides: { root: ({ theme }) => ({ ...menuItem(theme) }) },
};

// ----------------------------------------------------------------------

// eslint-disable-next-line import/prefer-default-export
export const menu = { MuiMenuItem };
