import Stack from '@mui/material/Stack';
import { conditionParsed, ECondition } from 'pages/HomePage/constants';
import { Checkbox, FormControlLabel } from '@mui/material';
import Box from '@mui/material/Box';
import { IFilters } from 'pages/HomePage/components/ProductList';


type TProps = {
    filters: IFilters;
    handleConditionChange: (condition: ECondition) => void;
}


export default function ConditionFilter({ filters, handleConditionChange }: TProps) {
  return (
    <Box>
      <Stack spacing={1}>
        {Object.values(ECondition).map((option) => (
          <FormControlLabel
            key={conditionParsed.parse(option).title}
            control={(
              <Checkbox
                checked={filters.condition[option]}
                onChange={() => handleConditionChange(option)}
                sx={{
                  '&.Mui-checked': {
                    color: 'primary.main',
                  },
                }}
              />
                        )}
            label={conditionParsed.parse(option).title}
            sx={{
              margin: 0,
              '& .MuiTypography-root': {
                fontSize: '0.875rem',
              },
            }}
          />
        ))}
      </Stack>
    </Box>
  );
}
