import type { Theme, Components, ComponentsVariants } from '@mui/material/styles';
import { paginationItemClasses } from '@mui/material/PaginationItem';
import { alpha } from '@mui/material';

// ----------------------------------------------------------------------

// NEW VARIANT
declare module '@mui/material/Pagination' {
  interface PaginationPropsVariantOverrides {
    soft: true;
  }

  interface PaginationPropsColorOverrides {
    info: true;
    success: true;
    warning: true;
    error: true;
  }
}

const COLORS = ['primary', 'secondary', 'info', 'success', 'warning', 'error'] as const;

// ----------------------------------------------------------------------

const softVariant: Record<string, ComponentsVariants<Theme>['MuiPagination']> = {
  colors: COLORS.map((color) => ({
    props: ({ ownerState }) => !ownerState.disabled && ownerState.variant === 'soft' && ownerState.color === color,
    style: ({ theme }) => ({
      [`& .${paginationItemClasses.root}`]: {
        [`&.${paginationItemClasses.selected}`]: {
          fontWeight: theme.typography.fontWeightBold,
          color: theme.palette[color].dark,
          backgroundColor: alpha(theme.palette[color].main, 0.08),
          '&:hover': { backgroundColor: alpha(theme.palette[color].main, 0.16) },
        },
      },
    }),
  })),
  standardColor: [
    {
      props: ({ ownerState }) => ownerState.variant === 'soft' && ownerState.color === 'standard',
      style: ({ theme }) => ({
        [`& .${paginationItemClasses.root}`]: {
          [`&.${paginationItemClasses.selected}`]: {
            fontWeight: theme.typography.fontWeightBold,
            backgroundColor: alpha(theme.palette.grey[500], 0.08),
            '&:hover': { backgroundColor: alpha(theme.palette.grey[500], 0.16) },
          },
        },
      }),
    },
  ],
};

// ----------------------------------------------------------------------

const MuiPagination: Components<Theme>['MuiPagination'] = {
  /** **************************************
   * VARIANTS
   *************************************** */
  variants: [
    /**
     * @variant soft
     */
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    ...[...softVariant.standardColor!, ...softVariant.colors!],
  ],

  /** **************************************
   * STYLE
   *************************************** */
  styleOverrides: {
    /**
     * @variant text
     */
    text: ({ ownerState, theme }) => ({
      [`& .${paginationItemClasses.root}`]: {
        [`&.${paginationItemClasses.selected}`]: {
          fontWeight: theme.typography.fontWeightBold,
          ...(ownerState.color === 'standard' && {
            color: theme.palette.common.white,
            backgroundColor: theme.palette.text.primary,
            '&:hover': { backgroundColor: theme.palette.grey[700] },
          }),
        },
      },
    }),
    /**
     * @variant outlined
     */
    outlined: ({ ownerState, theme }) => ({
      [`& .${paginationItemClasses.root}`]: {
        borderColor: alpha(theme.palette.grey[500], 0.24),
        [`&.${paginationItemClasses.selected}`]: {
          borderColor: 'currentColor',
          fontWeight: theme.typography.fontWeightBold,
          ...(ownerState.color === 'standard' && {
            backgroundColor: alpha(theme.palette.grey[500], 0.08),
          }),
        },
      },
    }),
  },
};

// ----------------------------------------------------------------------

// eslint-disable-next-line import/prefer-default-export
export const pagination = { MuiPagination };
