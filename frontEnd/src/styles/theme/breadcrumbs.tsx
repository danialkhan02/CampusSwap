import type { Theme, Components } from '@mui/material/styles';

// ----------------------------------------------------------------------

const MuiBreadcrumbs: Components<Theme>['MuiBreadcrumbs'] = {
  /** **************************************
   * STYLE
   *************************************** */
  styleOverrides: {
    ol: ({ theme }) => ({ rowGap: theme.spacing(0.5), columnGap: theme.spacing(2) }),

    li: ({ theme }) => ({ display: 'inline-flex', '& > *': { ...theme.typography.body2 } }),
    separator: { margin: 0 },
  },
};

// ----------------------------------------------------------------------

// eslint-disable-next-line import/prefer-default-export
export const breadcrumbs = { MuiBreadcrumbs };
