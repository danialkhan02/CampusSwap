import Box from '@mui/material/Box';
import { alpha, FormControlLabel, Radio } from '@mui/material';
import Stack from '@mui/material/Stack';
import { categoryParsed, ECategory } from 'pages/HomePage/constants';
import { IFilters } from 'pages/HomePage/queries';


type TProps = {
    filters: IFilters;
    handleCategoryChange: (category: ECategory | null) => void;
}

export default function CategoryFilter({ filters, handleCategoryChange }: TProps) {
  return (
    <Box>
      <Box
        sx={{
          maxHeight: 200,
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: (theme) => alpha(theme.palette.grey[500], 0.08),
            borderRadius: '8px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: (theme) => theme.palette.grey[400],
            borderRadius: '8px',
            '&:hover': {
              background: (theme) => theme.palette.grey[500],
            },
          },
          pr: 1,
          '&:focus': {
            outline: 'none',
          },
        }}
      >
        <Stack spacing={1}>
          {/* All Categories Option */}
          <FormControlLabel
            control={(
              <Radio
                checked={filters.category === null}
                onChange={() => handleCategoryChange(null)}
                sx={{
                  '&.Mui-checked': {
                    color: 'primary.main',
                  },
                }}
              />
                      )}
            label='All'
            sx={{
              margin: 0,
              '& .MuiTypography-root': {
                fontSize: '0.875rem',
              },
            }}
          />

          {/* Other Categories */}
          {Object.values(ECategory).map((option) => (
            <FormControlLabel
              key={categoryParsed.parse(option).title}
              control={(
                <Radio
                  checked={filters.category === option}
                  onChange={() => handleCategoryChange(option)}
                  sx={{
                    '&.Mui-checked': {
                      color: 'primary.main',
                    },
                  }}
                />
                          )}
              label={categoryParsed.parse(option).title}
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
    </Box>
  );
}
