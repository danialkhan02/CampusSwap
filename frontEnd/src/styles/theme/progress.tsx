import type { LinearProgressProps } from '@mui/material/LinearProgress';
import type { Theme, CSSObject, Components } from '@mui/material/styles';
import { alpha } from '@mui/material';

// ----------------------------------------------------------------------

const COLORS = ['primary', 'secondary', 'info', 'success', 'warning', 'error'] as const;

type ColorType = (typeof COLORS)[number];

// ----------------------------------------------------------------------

function styleColors(ownerState: LinearProgressProps, styles: (val: ColorType) => CSSObject) {
  const outputStyle = COLORS.reduce((acc, color) => {
    if (ownerState.color === color) {
      // eslint-disable-next-line no-param-reassign
      acc = styles(color);
    }
    return acc;
  }, {});

  return outputStyle;
}

const MuiLinearProgress: Components<Theme>['MuiLinearProgress'] = {
  /** **************************************
   * STYLE
   *************************************** */
  styleOverrides: {
    root: ({ theme, ownerState }) => {
      const styled = {
        colors: styleColors(ownerState, (color) => ({
          backgroundColor: alpha(theme.palette[color].main, 0.24),
        })),
        inheritColor: {
          ...(ownerState.color === 'inherit' && {
            '&::before': { display: 'none' },
            backgroundColor: alpha(theme.palette.text.primary, 0.24),
          }),
        },
      };
      return {
        borderRadius: 4,
        ...(ownerState.variant !== 'buffer' && { ...styled.inheritColor, ...styled.colors }),
      };
    },
    bar: { borderRadius: 'inherit' },
  },
};

// ----------------------------------------------------------------------

// eslint-disable-next-line import/prefer-default-export
export const progress = { MuiLinearProgress };
