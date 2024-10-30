import React from 'react';
import { useLoadScript } from '@react-google-maps/api';
import Spinner from 'components/Common/Spinner';


const libraries: any[] = ['places']; // Add 'places' library for Autocomplete

export default function LoadGoogleMaps({ children }: { children: React.ReactNode }) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  if (loadError) {
    return <Spinner />; // Do nothing if there’s an error
  }
  if (!isLoaded) return <Spinner />;

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
}
