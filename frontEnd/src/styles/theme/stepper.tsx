import type { Theme, Components } from '@mui/material/styles';

// ----------------------------------------------------------------------

const MuiStepConnector: Components<Theme>['MuiStepConnector'] = {
  /** **************************************
   * STYLE
   *************************************** */
  styleOverrides: { line: ({ theme }) => ({ borderColor: theme.palette.divider }) },
};

// ----------------------------------------------------------------------

// eslint-disable-next-line import/prefer-default-export
export const stepper = { MuiStepConnector };
