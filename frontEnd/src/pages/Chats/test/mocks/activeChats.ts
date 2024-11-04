import { OauthAuthenticationType } from 'pages/Authentication/queries';


const activeChatsData = {
  data: [
    {
      id: '1',
      sender: {
        id: '1',
        first_name: 'Payas',
        last_name: 'Hasteer',
        email: 'payas.hasteer@gmail.com',
        provider: OauthAuthenticationType.OAUTH_AUTHENTICATION_TYPE_MICROSOFT,
        stytch_id: 'stytch-1',
        profile_image_url: 'assets/avatar-25.webp',
        oauth_id: 'oauth-1',
      },
      receiver: {
        id: '2',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@gmail.com',
        provider: OauthAuthenticationType.OAUTH_AUTHENTICATION_TYPE_MICROSOFT,
        stytch_id: 'stytch-2',
        profile_image_url: 'assets/avatar-25.webp',
        oauth_id: 'oauth-2',
      },
      message: 'Hi there!',
      timestamp: '2024-10-01 07:10:56',
      read: false,
    },
    {
      id: '2',
      sender: {
        id: '2',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@gmail.com',
        provider: OauthAuthenticationType.OAUTH_AUTHENTICATION_TYPE_MICROSOFT,
        stytch_id: 'stytch-2',
        profile_image_url: 'assets/avatar-25.webp',
        oauth_id: 'oauth-2',
      },
      receiver: {
        id: '3',
        first_name: 'John',
        last_name: 'Smith',
        email: 'john.smith@gmail.com',
        provider: OauthAuthenticationType.OAUTH_AUTHENTICATION_TYPE_MICROSOFT,
        stytch_id: 'stytch-3',
        profile_image_url: 'assets/avatar-25.webp',
        oauth_id: 'oauth-3',
      },
      message: 'Is this available?',
      timestamp: '2024-10-01 07:10:56',
      read: false,
    },
  ],
};

export default activeChatsData;
