import CssBaseline from '@mui/material/CssBaseline';
import { Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Router from 'Router';
import AppAlerts from 'components/Common/AppAlerts';
import ErrorBoundary from 'components/Common/ErrorBoundary';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { CacheKeys } from 'utils/constants';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import createTheme from 'create-theme';


const queryClient = new QueryClient();


export default function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  React.useEffect(() => {
    if (prefersDarkMode) {
      localStorage.setItem(CacheKeys.enableDarkMode, 'true');
    }
    else {
      localStorage.removeItem(CacheKeys.enableDarkMode);
    }
  }, [prefersDarkMode]);

  const theme: any = createTheme();
  return (
    <React.StrictMode>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <CssVarsProvider defaultColorScheme='light' defaultMode='light' theme={theme}>
            <CssBaseline enableColorScheme />
            <AppAlerts>
              <ErrorBoundary>
                <Router />
              </ErrorBoundary>
            </AppAlerts>
          </CssVarsProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
}
