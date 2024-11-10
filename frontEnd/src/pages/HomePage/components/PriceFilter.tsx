import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { alpha, InputBase, Slider } from '@mui/material';
import Stack from '@mui/material/Stack';
import { inputBaseClasses } from '@mui/material/InputBase';
import { IFilters } from 'pages/HomePage/queries';


type TProps = {
    filters: IFilters;
    handlePriceChange: (_event: Event | null, newValue: number | number[]) => void;
    handleInputRangeChange: (newValue: [number, number]) => void;
}

export default function PriceFilter({
  filters,
  handlePriceChange, handleInputRangeChange,
}: TProps) {
  const marks = generateMarks(Math.max(200, filters.price[1]));
  const sliderMax = marks[marks.length - 1].value;

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 2,
        }}
      >
        <InputRange
          type='min'
          value={filters.price}
          onChange={handleInputRangeChange}
        />
        <InputRange
          type='max'
          value={filters.price}
          onChange={handleInputRangeChange}
        />
      </Box>

      <Slider
        value={[
          Math.min(filters.price[0], sliderMax),
          Math.min(filters.price[1], sliderMax),
        ]}
        onChange={handlePriceChange}
        step={Math.max(40, Math.floor(sliderMax / 5))}
        min={0}
        max={sliderMax}
        marks={marks}
        sx={{
          '& .MuiSlider-mark': {
            height: 8,
          },
          '& .MuiSlider-markLabel': {
            fontSize: '0.75rem',
            marginTop: 0.5,
          },
          '& .MuiSlider-thumb': {
            backgroundColor: '#fff',
            border: '2px solid currentColor',
          },
          width: 'calc(100% - 8px)',
          ml: 0.5,
        }}
      />
    </Box>
  );
}

const generateMarks = (maxValue: number) => {
  // Round up to nearest hundred for cleaner marks
  const roundedMax = Math.ceil(maxValue / 100) * 100;
  const step = Math.max(40, Math.floor(roundedMax / 5)); // Ensure minimum step of 40

  const marks = [];
  for (let i = 0; i <= roundedMax; i += step) {
    marks.push({
      value: i,
      label: i === 0 ? `$${i}` : `${i}`,
    });
  }
  return marks;
};

type InputRangeProps = {
    type: 'min' | 'max';
    value: number[];
    onChange: (newValue: [number, number]) => void;
};

function InputRange({ type, value, onChange }: InputRangeProps) {
  const min = value[0];

  const max = value[1];

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(event.target.value);
    if (type === 'min') {
      onChange([newValue, max]);
    }
    else {
      onChange([min, newValue]);
    }
  };

  const handleBlur = () => {
    let newMin = min;
    let newMax = max;

    if (min < 0) newMin = 0;
    if (newMin > newMax) {
      if (type === 'min') {
        newMin = newMax;
      }
      else {
        newMax = newMin;
      }
    }

    onChange([newMin, newMax]);
  };

  return (
    <Stack direction='row' alignItems='center' justifyContent='space-between' sx={{ width: 1 }}>
      <Typography
        variant='caption'
        sx={{
          flexShrink: 0,
          color: 'text.disabled',
          textTransform: 'capitalize',
          fontWeight: 'fontWeightSemiBold',
        }}
      >
        {`${type} ($)`}
      </Typography>

      <InputBase
        fullWidth
        value={type === 'min' ? min : max}
        onChange={handleChange}
        onBlur={handleBlur}
        inputProps={{
          step: 10,
          min: 0,
          type: 'number',
          'aria-labelledby': 'input-slider',
        }}
        sx={{
          maxWidth: 48,
          borderRadius: 0.75,
          bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
          [`& .${inputBaseClasses.input}`]: {
            pr: 1,
            py: 0.75,
            textAlign: 'right',
            typography: 'body2',
          },
        }}
      />
    </Stack>
  );
}
