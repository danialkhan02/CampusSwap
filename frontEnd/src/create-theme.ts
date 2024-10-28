import { experimental_extendTheme as extendTheme } from '@mui/material/styles';
import { alpha, Theme } from '@mui/material';
import { grey } from 'styles/theme/colors';
import shadows from 'styles/theme/shadows';
import { CustomShadows, customShadows } from 'styles/theme/customShadows';
import { components } from 'styles/theme/components';


declare module '@mui/material/styles' {
  interface Theme {
    customShadows: CustomShadows
  }
  interface ThemeOptions {
    customShadows?: CustomShadows
  }
}

export function pxToRem(value: number): string {
  return `${value / 16}rem`;
}

export function setFont(fontName: string) {
  return `"${fontName}",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"`;
}

export const mediaQueries = {
  upXs: '@media (min-width:0px)',
  upSm: '@media (min-width:600px)',
  upMd: '@media (min-width:900px)',
  upLg: '@media (min-width:1200px)',
  upXl: '@media (min-width:1536px)',
};

export function responsiveFontSizes({ sm, md, lg }: { sm: number; md: number; lg: number }) {
  return {
    [mediaQueries.upSm]: { fontSize: pxToRem(sm) },
    [mediaQueries.upMd]: { fontSize: pxToRem(md) },
    [mediaQueries.upLg]: { fontSize: pxToRem(lg) },
  };
}

export default function createTheme(): Theme {
  const baseAction = {
    hover: alpha(grey[500], 0.08),
    selected: alpha(grey[500], 0.16),
    focus: alpha(grey[500], 0.24),
    disabled: alpha(grey[500], 0.8),
    disabledBackground: alpha(grey[500], 0.24),
    hoverOpacity: 0.08,
    disabledOpacity: 0.48,
  };

  const theme = extendTheme({
    custom: {
      appBarHeight: '64px',
      sidebarWidth: '210px',
      smSidebarWidth: '80px',
    },
    colorSchemes: {
      light: {
        palette: {
          action: { ...baseAction, active: grey[600] },
          background: {
            default: '#FFFFFF',
            paper: '#FFFFFF',
            // neutral: '#F4F6F8',
          },
          common: { black: '#000000', white: '#ffffff' },
          divider: alpha(grey[500], 0.2),
          error: {
            light: '#FFAC82',
            main: '#FF5630',
            dark: '#B71D18',
            contrastText: '#FFFFFF',
          },
          info: {
            light: '#61F3F3',
            main: '#00B8D9',
            dark: '#006C9C',
            contrastText: '#FFFFFF',
          },
          primary: {
            light: '#5BE49B',
            main: '#00A76F',
            dark: '#007867',
            contrastText: '#FFFFFF',
          },
          secondary: {
            light: '#C684FF',
            main: '#8E33FF',
            dark: '#5119B7',
            contrastText: '#FFFFFF',
          },
          success: {
            light: '#77ED8B',
            main: '#22C55E',
            dark: '#118D57',
            contrastText: '#ffffff',
          },
          text: {
            primary: grey[800],
            secondary: grey[600],
            disabled: grey[500],
          },
          warning: {
            light: '#FFD666',
            main: '#FFAB00',
            dark: '#B76E00',
            contrastText: '#1C252E',
          },
        },
      },
    },
    shadows: shadows(),
    customShadows: customShadows(),
    direction: 'ltr',
    shape: { borderRadius: 8 },
    components,
    typography: {
      fontFamily: setFont('Public Sans Variable'),
      fontWeightLight: '300',
      fontWeightRegular: '400',
      fontWeightMedium: '500',
      fontWeightBold: '600',
      h1: {
        fontWeight: 800,
        lineHeight: 80 / 64,
        fontSize: pxToRem(40),
        fontFamily: setFont('Barlow'),
        ...responsiveFontSizes({ sm: 52, md: 58, lg: 64 }),
      },
      h2: {
        fontWeight: 800,
        lineHeight: 64 / 48,
        fontSize: pxToRem(32),
        fontFamily: setFont('Barlow'),
        ...responsiveFontSizes({ sm: 40, md: 44, lg: 48 }),
      },
      h3: {
        fontWeight: 700,
        lineHeight: 1.5,
        fontSize: pxToRem(24),
        fontFamily: setFont('Barlow'),
        ...responsiveFontSizes({ sm: 26, md: 30, lg: 32 }),
      },
      h4: {
        fontWeight: 700,
        lineHeight: 1.5,
        fontSize: pxToRem(20),
        ...responsiveFontSizes({ sm: 20, md: 24, lg: 24 }),
      },
      h5: {
        fontWeight: 700,
        lineHeight: 1.5,
        fontSize: pxToRem(18),
        ...responsiveFontSizes({ sm: 19, md: 20, lg: 20 }),
      },
      h6: {
        fontWeight: 600,
        lineHeight: 28 / 18,
        fontSize: pxToRem(17),
        ...responsiveFontSizes({ sm: 18, md: 18, lg: 18 }),
      },
      subtitle1: {
        fontWeight: 600,
        lineHeight: 1.5,
        fontSize: pxToRem(16),
      },
      subtitle2: {
        fontWeight: 600,
        lineHeight: 22 / 14,
        fontSize: pxToRem(14),
      },
      body1: {
        lineHeight: 1.5,
        fontSize: pxToRem(16),
      },
      body2: {
        lineHeight: 22 / 14,
        fontSize: pxToRem(14),
      },
      caption: {
        lineHeight: 1.5,
        fontSize: pxToRem(12),
      },
      overline: {
        fontWeight: 700,
        lineHeight: 1.5,
        fontSize: pxToRem(12),
        textTransform: 'uppercase',
      },
      button: {
        fontWeight: 700,
        lineHeight: 24 / 14,
        fontSize: pxToRem(14),
        textTransform: 'unset',
      },
    },
    cssVarPrefix: '',
  });

  return theme;
}
