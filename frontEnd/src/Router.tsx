import PrivateRoute from 'components/Common/PrivateRoute';
import Borders from 'components/Layouts/Borders';
import { trackPageView } from 'instrumentation/analytics';
import AuthRouter from 'pages/Authentication/Router';
import ConnectionRouter from 'pages/Connections/Router';
import PageNotFound from 'pages/Exceptions/PageNotFound';
import HomePage from 'pages/HomePage/HomePage';
import React from 'react';
import {
  Navigate, Route, Routes, useLocation,
} from 'react-router-dom';
import * as spaUrls from 'utils/spaUrls';
import ProductDetails from 'pages/HomePage/ProductDetails';
import UserProfile from 'pages/UserProfile/UserProfile';
import ChatList from 'pages/Chats/ChatList';
import ChatPage from 'pages/HomePage/ChatPage';


export default function Router() {
  const location = useLocation();

  React.useEffect(() => { trackPageView(); }, [location]);

  return (
    <Borders>
      <Routes>
        <Route path='/auth/*' element={<AuthRouter />} />
        <Route path='/connections/*' element={<ConnectionRouter />} />
        <Route path='/' element={<Navigate to={spaUrls.auth.login} replace />} />
        <Route
          path={spaUrls.homepage}
          element={<PrivateRoute outlet={<HomePage />} />}
        />
        <Route
          path={spaUrls.product.details}
          element={<PrivateRoute outlet={<ProductDetails />} />}
        />
        <Route
          path={spaUrls.user.profile}
          element={<PrivateRoute outlet={<UserProfile />} />}
        />
        <Route
          path={spaUrls.chats.base}
          element={<PrivateRoute outlet={<ChatPage />} />}
        />
        <Route path='/404' element={<PageNotFound />} />
        <Route path='*' element={<Navigate to='/404' replace />} />
      </Routes>
    </Borders>
  );
}
