import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';


type TProps = {
    title: string;
}

export default function ProductHeader({ title }: TProps) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant='h4'>{title}</Typography>
      </Grid>
    </Grid>
  );
}
