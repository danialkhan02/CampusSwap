import React, { useEffect, useState } from 'react';
import { TextField, Autocomplete, CircularProgress } from '@mui/material';


type Prediction = {
    description: string;
    place_id: string;
    structured_formatting: {
        main_text: string;
        secondary_text: string;
    };
};

type TProps = {
    input: string;
    setInput: (address: string, lat?: number, lng?: number) => void;
};

export default function LocationAutocomplete({ input, setInput }: TProps) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const autocompleteServiceRef = React.useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = React.useRef<google.maps.places.PlacesService | null>(null);

  useEffect(() => {
    if (!autocompleteServiceRef.current && window.google) {
      autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
      placesServiceRef.current = new window.google.maps.places.PlacesService(document.createElement('div'));
    }
  }, []);

  const fetchPredictions = (inputValue: string) => {
    if (!autocompleteServiceRef.current || !inputValue) return;
    setLoading(true);
    autocompleteServiceRef.current.getPlacePredictions(
      { input: inputValue, types: ['geocode'] },
      (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          setPredictions(results || []);
        }
        else {
          setPredictions([]);
        }
        setLoading(false);
      },
    );
  };

  const fetchPlaceDetails = (placeId: string) => {
    if (!placesServiceRef.current || !placeId) return;

    placesServiceRef.current.getDetails(
      { placeId },
      (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK
            && place?.geometry?.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const address = place.formatted_address || '';
          setInput(address, lat, lng);
        }
        else {
          console.error('Error fetching place details:', status);
        }
      },
    );
  };


  const handleInputChange = (event: React.SyntheticEvent, newInput: string) => {
    setInput(newInput);
    if (newInput.length > 2) {
      fetchPredictions(newInput);
    }
    else {
      setPredictions([]);
    }
  };

  const handleSelect = (
    event: React.SyntheticEvent,
    selectedOption: Prediction | string | null,
  ) => {
    if (typeof selectedOption === 'string') {
      setInput(selectedOption);
    }
    else if (selectedOption) {
      setInput(selectedOption.description);
      fetchPlaceDetails(selectedOption.place_id);
    }
    setPredictions([]);
  };

  return (
    <Autocomplete
      freeSolo
      options={predictions}
      getOptionLabel={(option) => (typeof option === 'string' ? option : option.description)}
      inputValue={input}
      onInputChange={handleInputChange}
      onChange={handleSelect}
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          label='Enter a location'
          variant='outlined'
          fullWidth
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color='inherit' size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}
