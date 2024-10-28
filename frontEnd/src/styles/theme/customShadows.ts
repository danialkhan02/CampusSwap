import { alpha } from '@mui/material';
import { grey } from 'styles/theme/colors';
import theme from 'theme';
import { common } from '@mui/material/colors';


export interface CustomShadows {
    z1?: string;
    z4?: string;
    z8?: string;
    z12?: string;
    z16?: string;
    z20?: string;
    z24?: string;
    //
    primary?: string;
    secondary?: string;
    info?: string;
    success?: string;
    warning?: string;
    error?: string;
    //
    card?: string;
    dialog?: string;
    dropdown?: string;
}

declare module '@mui/material/styles' {
    interface Theme {
        customShadows: CustomShadows;
    }
}

export function createShadowColor(colorChannel: string) {
  return `0 8px 16px 0 ${alpha(colorChannel, 0.24)}`;
}

export function customShadows() {
  const colorChannel = grey[500];

  return {
    z1: `0 1px 2px 0 ${alpha(colorChannel, 0.16)}`,
    z4: `0 4px 8px 0 ${alpha(colorChannel, 0.16)}`,
    z8: `0 8px 16px 0 ${alpha(colorChannel, 0.16)}`,
    z12: `0 12px 24px -4px ${alpha(colorChannel, 0.16)}`,
    z16: `0 16px 32px -4px ${alpha(colorChannel, 0.16)}`,
    z20: `0 20px 40px -4px ${alpha(colorChannel, 0.16)}`,
    z24: `0 24px 48px 0 ${alpha(colorChannel, 0.16)}`,
    //
    dialog: `-40px 40px 80px -8px ${alpha(common.black, 0.24)}`,
    card: `0 0 2px 0 ${alpha(colorChannel, 0.2)}, 0 12px 24px -4px ${alpha(colorChannel, 0.12)}`,
    dropdown: `0 0 2px 0 ${alpha(colorChannel, 0.24)}, -20px 20px 40px -4px ${alpha(colorChannel, 0.24)}`,
    //
    primary: createShadowColor(theme.palette.primary.main),
    secondary: createShadowColor(theme.palette.secondary.main),
    info: createShadowColor(theme.palette.info.main),
    success: createShadowColor(theme.palette.success.main),
    warning: createShadowColor(theme.palette.warning.main),
    error: createShadowColor(theme.palette.error.main),
  };
}

