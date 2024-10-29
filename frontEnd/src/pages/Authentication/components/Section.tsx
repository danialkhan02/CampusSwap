import type { BoxProps } from '@mui/material/Box';
import type { CSSObject } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material';
import bgimage from 'assets/background-3.webp';

// ----------------------------------------------------------------------

type SectionProps = BoxProps & {
    title?: string;
    imgUrl?: string;
    subtitle?: string;
};

export default function Section({
  sx,
  title = 'Manage the job',
  imgUrl = 'assets/illustrations/illustration-dashboard.webp',
  subtitle = 'More effectively with optimized workflows.',
  ...other
}: SectionProps) {
  const theme = useTheme();

  type BgGradientProps = {
        color: string;
        imgUrlGiven?: string;
    };

  function bgGradient({ color, imgUrlGiven }: BgGradientProps): CSSObject {
    if (imgUrlGiven) {
      return {
        background: `linear-gradient(${color}), url(${imgUrlGiven})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
      };
    }
    return { background: `linear-gradient(${color})` };
  }

  return (
    <Box
      sx={{
        ...bgGradient({
          color: `0deg, ${alpha(theme.palette.background.default, 0.92)}, ${alpha(theme.palette.background.default, 0.92)}`,
          imgUrlGiven: 'assets/background-3.webp',
        }),
        px: 3,
        pb: 3,
        width: 1,
        maxWidth: 480,
        display: 'none',
        position: 'relative',
        pt: 'var(--layout-header-desktop-height)',
        ...sx,
      }}
    >
      <div>
        <Typography variant='h3' sx={{ textAlign: 'center' }}>
          {title}
        </Typography>

        {subtitle && (
        <Typography sx={{ color: 'text.secondary', textAlign: 'center', mt: 2 }}>
          {subtitle}
        </Typography>
        )}
      </div>

      <Box
        component='img'
        alt='Dashboard illustration'
        src={imgUrl}
        sx={{ width: 1, aspectRatio: '4/3', objectFit: 'cover' }}
      />
    </Box>
  );
}
