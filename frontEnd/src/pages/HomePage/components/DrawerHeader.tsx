import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';


type TProps = {
    handleReset: () => void;
    onClose: () => void;
    canReset: boolean;
}


export default function DrawerHeader({ handleReset, onClose, canReset }: TProps) {
  return (
    <Box
      display='flex'
      alignItems='center'
      sx={{
        p: 2,
        pb: 1.5,
      }}
    >
      <Typography variant='h6' sx={{ flexGrow: 1 }}>
        Filters
      </Typography>

      <Tooltip title='Reset'>
        <IconButton onClick={handleReset}>
          <Badge color='error' variant='dot' invisible={!canReset}>
            <RefreshIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <IconButton onClick={onClose}>
        <CloseIcon />
      </IconButton>
    </Box>
  );
}
