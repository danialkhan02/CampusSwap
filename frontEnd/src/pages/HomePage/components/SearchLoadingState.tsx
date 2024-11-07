import { Box, CircularProgress, Typography } from '@mui/material';
import Fade from '@mui/material/Fade';


interface SearchLoadingStateProps {
  isSearching: boolean;
  searchTerm: string;
  minHeight?: string;
}

export default function SearchLoadingState({
  isSearching,
  searchTerm,
  minHeight = 'calc(100vh - 300px)',
}: SearchLoadingStateProps) {
  const shouldShow = isSearching && searchTerm.length >= 2;

  return (
    <Fade in={shouldShow} timeout={300}>
      <Box
        display={shouldShow ? 'flex' : 'none'}
        flexDirection='column'
        alignItems='center'
        justifyContent='center'
        minHeight={minHeight}
        width='100%'
        position='absolute'
        top='50%'
        left='50%'
        sx={{
          transform: 'translate(-50%, -50%)',
          zIndex: 1,
        }}
      >
        <CircularProgress size={40} />
        <Typography variant='h6' sx={{ mt: 2 }}>
          Searching for &apos;
          {searchTerm}
          ...&apos;
        </Typography>
      </Box>
    </Fade>
  );
}
