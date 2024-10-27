import type { Theme, Components } from '@mui/material/styles';
import { listClasses } from '@mui/material/List';
import { paper } from 'styles/theme/utils';


// ----------------------------------------------------------------------

const MuiPopover: Components<Theme>['MuiPopover'] = {
  /** **************************************
   * STYLE
   *************************************** */
  styleOverrides: {
    paper: ({ theme }) => ({
      ...paper({ theme, dropdown: true }),
      [`& .${listClasses.root}`]: { paddingTop: 0, paddingBottom: 0 },
    }),
  },
};

// ----------------------------------------------------------------------

// eslint-disable-next-line import/prefer-default-export
export const popover = { MuiPopover };
