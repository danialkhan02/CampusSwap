import productImage1 from 'assets/product-1.webp';
import { OauthAuthenticationType } from 'pages/Authentication/queries';
import productImage2 from 'assets/product-2.webp';
import productImage3 from 'assets/product-3.webp';
import productImage4 from 'assets/product-4.webp';
import productImage5 from 'assets/product-5.webp';
import productImage6 from 'assets/product-6.webp';


const mockProductsData = {
  data: {
    items: [
      {
        id: '1',
        name: 'Urban Explorer Sneakers',
        price: 35.71,
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
      {
        id: '2',
        name: 'Classic Leather Loafers',
        price: 35.54,
        images: [productImage2],
        seller: {
          id: '1',
          first_name: 'Payas',
          last_name: 'Hasteer',
          email: 'payas.hasteer@mail.utoronto.ca',
          provider: OauthAuthenticationType.OAUTH_AUTHENTICATION_TYPE_MICROSOFT,
          stytch_id: 'stytch-1',
          oauth_id: 'oauth-1',
        },
        interested_buyers: [],
        location: {
          latitude: 1,
          longitude: 1,
          address: '450 Front St W.',
        },
      },
      {
        id: '3',
        name: 'Urban Explorer Sneakers',
        price: 35.71,
        images: [productImage3],
        seller: {
          id: '1',
          first_name: 'Payas',
          last_name: 'Hasteer',
          email: 'payas.hasteer@mail.utoronto.ca',
          provider: OauthAuthenticationType.OAUTH_AUTHENTICATION_TYPE_MICROSOFT,
          stytch_id: 'stytch-1',
          oauth_id: 'oauth-1',
        },
        interested_buyers: [],
        location: {
          latitude: 1,
          longitude: 1,
          address: '450 Front St W.',
        },
      },
      {
        id: '4',
        name: 'Classic Leather Loafers',
        price: 35.54,
        images: [productImage4],
        seller: {
          id: '1',
          first_name: 'Payas',
          last_name: 'Hasteer',
          email: 'payas.hasteer@mail.utoronto.ca',
          provider: OauthAuthenticationType.OAUTH_AUTHENTICATION_TYPE_MICROSOFT,
          stytch_id: 'stytch-1',
          oauth_id: 'oauth-1',
        },
        interested_buyers: [],
        location: {
          latitude: 1,
          longitude: 1,
          address: '450 Front St W.',
        },
      },
      {
        id: '5',
        name: 'Urban Explorer Sneakers',
        price: 35.71,
        images: [productImage5],
        seller: {
          id: '1',
          first_name: 'Payas',
          last_name: 'Hasteer',
          email: 'payas.hasteer@mail.utoronto.ca',
          provider: OauthAuthenticationType.OAUTH_AUTHENTICATION_TYPE_MICROSOFT,
          stytch_id: 'stytch-1',
          oauth_id: 'oauth-1',
        },
        interested_buyers: [],
        location: {
          latitude: 1,
          longitude: 1,
          address: '450 Front St W.',
        },
      },
      {
        id: '6',
        name: 'Classic Leather Loafers',
        price: 35.54,
        images: [productImage6],
        seller: {
          id: '1',
          first_name: 'Payas',
          last_name: 'Hasteer',
          email: 'payas.hasteer@mail.utoronto.ca',
          provider: OauthAuthenticationType.OAUTH_AUTHENTICATION_TYPE_MICROSOFT,
          stytch_id: 'stytch-1',
          oauth_id: 'oauth-1',
        },
        interested_buyers: [],
        location: {
          latitude: 1,
          longitude: 1,
          address: '450 Front St W.',
        },
      },
    ],
  },
};

export default mockProductsData;
