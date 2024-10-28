import Login from 'pages/Authentication/Login';
import Logout from 'pages/Authentication/Logout';
import LandingPad from 'pages/Authentication/components/LandingPad';
import { Route, Routes } from 'react-router-dom';
import { AuthSplitLayout } from 'pages/Authentication/components/AuthSplitLayout';


export default function Router() {
  return (
    <Routes>
      <Route path='login' element={<AuthSplitLayout><Login /></AuthSplitLayout>} />
      <Route path='landing-pad' element={<LandingPad />} />
      <Route path='logout' element={<Logout />} />
    </Routes>
  );
}
