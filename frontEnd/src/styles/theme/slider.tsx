import type { Theme, Components } from '@mui/material/styles';
import { sliderClasses } from '@mui/material/Slider';
import { alpha } from '@mui/material';

// ----------------------------------------------------------------------

declare module '@mui/material/Slider' {
  interface SliderPropsColorOverrides {
    inherit: true;
  }
}

// ----------------------------------------------------------------------

const SIZE = {
  rail: { small: 6, medium: 10 },
  thumb: { small: 16, medium: 20 },
  mark: { small: 4, medium: 6 },
};

const MuiSlider: Components<Theme>['MuiSlider'] = {
  /** **************************************
   * DEFAULT PROPS
   *************************************** */
  defaultProps: { size: 'small' },

  /** **************************************
   * VARIANTS
   *************************************** */
  variants: [
    /**
     * @color inherit
     */
    {
      props: ({ ownerState }) => ownerState.color === 'inherit',
      style: ({ theme }) => ({
        [`& .${sliderClasses.markActive}`]: {},
      }),
    },
    /**
     * @state disabled
     */
    {
      props: ({ ownerState }) => !!ownerState.disabled,
      style: ({ theme }) => ({
        [`&.${sliderClasses.disabled}`]: {
          color: alpha(
            theme.palette.grey[500],
            theme.palette.action.disabledOpacity,
          ),
        },
      }),
    },
  ],

  /** **************************************
   * STYLE
   *************************************** */
  styleOverrides: {
    root: ({ theme }) => ({
      [`& .${sliderClasses.thumb}`]: {
        borderWidth: 1,
        borderStyle: 'solid',
        width: SIZE.thumb.medium,
        height: SIZE.thumb.medium,
        boxShadow: theme.customShadows.z1,
        color: theme.palette.common.white,
        borderColor: alpha(theme.palette.grey[500], 0.08),
        '&::before': {
          opacity: 0.4,
          boxShadow: 'none',
          width: 'calc(100% - 4px)',
          height: 'calc(100% - 4px)',
          backgroundImage: `linear-gradient(180deg, ${theme.palette.grey[500]}, ${alpha(theme.palette.grey[500], 0)})`,
        },
      },
    }),
    rail: ({ theme }) => ({
      opacity: 0.12,
      height: SIZE.rail.medium,
      backgroundColor: theme.palette.grey[500],
    }),
    track: { height: SIZE.rail.medium },
    mark: ({ theme }) => ({
      width: 1,
      height: SIZE.mark.medium,
      backgroundColor: alpha(theme.palette.grey[500], 0.48),
      '&[data-index="0"]': { display: 'none' },
    }),
    markActive: ({ theme }) => ({
      backgroundColor: alpha(theme.palette.common.white, 0.64),
    }),
    markLabel: ({ theme }) => ({
      fontSize: theme.typography.pxToRem(13),
      color: theme.palette.text.disabled,
    }),
    valueLabel: ({ theme }) => ({
      borderRadius: 8,
      backgroundColor: theme.palette.grey[800],
    }),
    sizeSmall: {
      [`& .${sliderClasses.thumb}`]: { width: SIZE.thumb.small, height: SIZE.thumb.small },
      [`& .${sliderClasses.rail}`]: { height: SIZE.rail.small },
      [`& .${sliderClasses.track}`]: { height: SIZE.rail.small },
      [`& .${sliderClasses.mark}`]: { height: SIZE.mark.small },
    },
  },
};

// ----------------------------------------------------------------------

// eslint-disable-next-line import/prefer-default-export
export const slider = {
  MuiSlider,
};
