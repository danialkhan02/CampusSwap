import type { Theme, Components } from '@mui/material/styles';
import { tooltipClasses } from '@mui/material/Tooltip';


// ----------------------------------------------------------------------

const MuiTooltip: Components<Theme>['MuiTooltip'] = {
  /** **************************************
   * STYLE
   *************************************** */
  styleOverrides: {
    tooltip: ({ theme }) => ({
      backgroundColor: theme.palette.grey[800],
    }),
    arrow: ({ theme }) => ({
      color: theme.palette.grey[800],
    }),
    popper: {
      [`&.${tooltipClasses.popper}[data-popper-placement*="bottom"] .${tooltipClasses.tooltip}`]: {
        marginTop: 12,
      },
      [`&.${tooltipClasses.popper}[data-popper-placement*="top"] .${tooltipClasses.tooltip}`]: {
        marginBottom: 12,
      },
      [`&.${tooltipClasses.popper}[data-popper-placement*="right"] .${tooltipClasses.tooltip}`]: {
        marginLeft: 12,
      },
      [`&.${tooltipClasses.popper}[data-popper-placement*="left"] .${tooltipClasses.tooltip}`]: {
        marginRight: 12,
      },
    },
  },
};

// ----------------------------------------------------------------------

// eslint-disable-next-line import/prefer-default-export
export const tooltip = { MuiTooltip };
