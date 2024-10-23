import App from 'App';
import { init as initAnalytics } from 'instrumentation/analytics';
import * as React from 'react';
import ReactDOM from 'react-dom/client';
import 'index.css';
import StytchProviderWithHistory from 'pages/Authentication/components/Stytch-provider-with-history';


const domRoot = document.getElementById('root') as HTMLElement;
const root = ReactDOM.createRoot(domRoot);
root.render(
  <React.StrictMode>
    <StytchProviderWithHistory>
      <App />
    </StytchProviderWithHistory>
  </React.StrictMode>,
);
initAnalytics();
