import { CSSObject } from '@mui/material/styles';
import {
  alpha, dividerClasses, menuItemClasses, Theme,
} from '@mui/material';
import { checkboxClasses } from '@mui/material/Checkbox';
import { autocompleteClasses } from '@mui/material/Autocomplete';


export type BgBlurProps = {
    color: string;
    blur?: number;
    imgUrl?: string;
};

export function bgBlur({ color, blur = 6, imgUrl }: BgBlurProps): CSSObject {
  if (imgUrl) {
    return {
      position: 'relative',
      backgroundImage: `url(${imgUrl})`,
      '&::before': {
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 9,
        content: '""',
        width: '100%',
        height: '100%',
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
        backgroundColor: color,
      },
    };
  }
  return {
    backdropFilter: `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
    backgroundColor: color,
  };
}

type PaperProps = {
    theme: Theme;
    color?: string;
    dropdown?: boolean;
};

export function paper({ theme, color, dropdown }: PaperProps) {
  return {
    ...bgBlur({
      color: color ?? alpha(theme.palette.background.paper, 0.9),
      blur: 20,
    }),
    backgroundImage: 'url(assets/core/cyan-blur.png), url(assets/core/red-blur.png)',
    backgroundRepeat: 'no-repeat, no-repeat',
    backgroundPosition: 'top right, left bottom',
    backgroundSize: '50%, 50%',
    ...(theme.direction === 'rtl' && { backgroundPosition: 'top left, right bottom' }),
    ...(dropdown && {
      padding: theme.spacing(0.5),
      boxShadow: theme.customShadows.dropdown,
      borderRadius: `${theme.shape.borderRadius * 1.25}px`,
    }),
  };
}

/**
 * Usage:
 * ...menuItem(theme)
 */
export function menuItem(theme: Theme) {
  return {
    ...theme.typography.body2,
    padding: theme.spacing(0.75, 1),
    borderRadius: theme.shape.borderRadius * 0.75,
    '&:not(:last-of-type)': { marginBottom: 4 },
    [`&.${menuItemClasses.selected}`]: {
      fontWeight: theme.typography.fontWeightBold,
      backgroundColor: theme.palette.action.selected,
      '&:hover': { backgroundColor: theme.palette.action.hover },
    },
    [`& .${checkboxClasses.root}`]: {
      padding: theme.spacing(0.5),
      marginLeft: theme.spacing(-0.5),
      marginRight: theme.spacing(0.5),
    },
    [`&.${autocompleteClasses.option}[aria-selected="true"]`]: {
      backgroundColor: theme.palette.action.selected,
      '&:hover': { backgroundColor: theme.palette.action.hover },
    },
    [`&+.${dividerClasses.root}`]: { margin: theme.spacing(0.5, 0) },
  };
}
