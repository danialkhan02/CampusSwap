import {
  Autocomplete, Box, FormControlLabel, Radio, RadioGroup, Stack, TextField,
} from '@mui/material';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { IFilters } from 'pages/HomePage/components/ProductList';
import { ILocation } from 'pages/HomePage/queries';
import { Logger } from 'utils/logger';


type TProps = {
  filters: IFilters;
  onLocationChange: (location: ILocation) => void;
  onRadiusChange: (radius: number) => void;
}

export default function LocationFilter({ filters, onLocationChange, onRadiusChange }: TProps) {
  const [searchInput, setSearchInput] = useState(filters.location.address || '');
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [placesService, setPlacesService] = useState<
      google.maps.places.AutocompleteService | null>(null);
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);
  const [selectedPrediction, setSelectedPrediction] = useState<
      google.maps.places.AutocompletePrediction | null>(null);
  const distanceOptions = [
    { value: 250, label: '250m' },
    { value: 500, label: '500m' },
    { value: 1000, label: '1km' },
    { value: 2000, label: '2km' },
    { value: 5000, label: '5km' },
    { value: 10000, label: '10km' },
  ];

  useEffect(() => {
    setPlacesService(new google.maps.places.AutocompleteService());
    setGeocoder(new google.maps.Geocoder());
  }, []);

  useEffect(() => {
    // Check if filters have been reset
    if (filters.location.address === '' && !filters.location.latitude && !filters.location.longitude) {
      setSearchInput('');
      setSelectedPrediction(null);
      setPredictions([]);
    }
    else {
      setSearchInput(filters.location.address || '');
    }
  }, [filters.location]);

  const handleLocationSearch = async (input: string) => {
    setSearchInput(input);

    if (input.length > 2 && placesService) {
      try {
        const response = await placesService.getPlacePredictions({
          input,
          types: ['geocode', 'establishment'],
        });
        setPredictions(response.predictions);
      }
      catch (error) {
        Logger.error('Error fetching predictions:', error);
      }
    }
  };

  const handleLocationSelect = async (
    prediction: google.maps.places.AutocompletePrediction | null,
  ) => {
    setSelectedPrediction(prediction);

    if (prediction && geocoder) {
      try {
        const response = await geocoder.geocode({
          placeId: prediction.place_id,
        });

        if (response.results[0]) {
          const { location } = response.results[0].geometry;
          onLocationChange({
            address: prediction.description,
            latitude: location.lat(),
            longitude: location.lng(),
          });
        }
      }
      catch (error) {
        Logger.error('Error geocoding location:', error);
      }
    }
    else {
      onLocationChange({
        address: '',
        latitude: 0,
        longitude: 0,
      });
    }
  };

  return (
    <Box>
      <Stack spacing={2}>
        <Autocomplete
          fullWidth
          options={predictions}
          getOptionLabel={(option) => option.description}
          inputValue={searchInput}
          onInputChange={(_, value) => handleLocationSearch(value)}
          onChange={(_, value) => handleLocationSelect(value)}
          value={selectedPrediction}
          isOptionEqualToValue={(option, value) => option.place_id === value.place_id}
          renderInput={(params) => (
            <TextField
                // eslint-disable-next-line react/jsx-props-no-spreading
              {...params}
              placeholder='Enter location'
              size='small'
            />
          )}
          renderOption={(props, option) => (
            // eslint-disable-next-line react/jsx-props-no-spreading
            <li {...props}>
              <Typography variant='body2'>{option.description}</Typography>
            </li>
          )}
        />

        <Box>
          <Typography
            variant='body2'
            sx={{
              mb: 1,
              color: 'text.secondary',
            }}
          >
            Distance:
            {' '}
            {filters.radius >= 1000
              ? `${(filters.radius / 1000).toFixed(1)}km`
              : `${filters.radius}m`}
          </Typography>
          <RadioGroup
            value={filters.radius}
            onChange={(e) => onRadiusChange(Number(e.target.value))}
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 1,
            }}
          >
            {distanceOptions.map((option) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio />}
                label={option.label}
                sx={{
                  margin: 0,
                  '& .MuiFormControlLabel-label': {
                    fontSize: '0.875rem',
                  },
                }}
              />
            ))}
          </RadioGroup>
        </Box>
      </Stack>
    </Box>
  );
}
