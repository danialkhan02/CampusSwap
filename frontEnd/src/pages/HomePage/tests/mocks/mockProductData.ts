import productImage1 from 'assets/product-1.webp';
import { OauthAuthenticationType } from 'pages/Authentication/queries';


const mockSingleProductData = {
  data: {
    id: '1',
    name: 'Urban Explorer Sneakers',
    price: 35.71,
    description: 'Blank Blank Blank',
    category: 'TEXTBOOKS',
    condition: 'CONDITION_NEW',
    images: [productImage1],
    seller: {
      id: '1',
      first_name: 'Payas',
      last_name: 'Hasteer',
      email: 'payas.hasteer@mail.utoronto.ca',
      provider: OauthAuthenticationType.OAUTH_AUTHENTICATION_TYPE_MICROSOFT,
      stytch_id: 'stytch-1',
      oauth_id: 'oauth-1',
    },
    interested_buyers: [
      {
        id: '1',
        first_name: 'Payas',
        last_name: 'Hasteer',
        email: 'payas.hasteer@mail.utoronto.ca',
        provider: OauthAuthenticationType.OAUTH_AUTHENTICATION_TYPE_MICROSOFT,
        stytch_id: 'stytch-1',
        oauth_id: 'oauth-1',
      },
      {
        id: '1',
        first_name: 'Payas',
        last_name: 'Hasteer',
        email: 'payas.hasteer@mail.utoronto.ca',
        provider: OauthAuthenticationType.OAUTH_AUTHENTICATION_TYPE_MICROSOFT,
        stytch_id: 'stytch-1',
        oauth_id: 'oauth-1',
      },
    ],
    location: {
      latitude: 1,
      longitude: 1,
      address: '450 Front St W.',
    },
  },
};

export default mockSingleProductData;
