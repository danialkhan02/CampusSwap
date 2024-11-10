const baseUrl = process.env.REACT_APP_SERVER_URL as string;

const sample = {
  status: `${baseUrl}/status`,
};

const user = {
  details: (userId: string) => `${baseUrl}/api/v1/users/${userId}`,
  create: `${baseUrl}/api/v1/users`,
};

const seller = {
  details: (sellerId: string) => `${baseUrl}/api/v1/seller_profiles/${sellerId}`,
};

const chat = {
  active: (userId: string) => `${baseUrl}/api/v1/chat/active/${userId}`,
  history: (userId: string, recieverId: string) => `${baseUrl}/api/v1/chat/history/${userId}/${recieverId}`,
};

const product = {
  list: `${baseUrl}/api/v1/products/list`,
  create: `${baseUrl}/api/v1/products/create`,
  generate: `${baseUrl}/api/v1/products/generate-description`,
  details: (id: string) => `${baseUrl}/api/v1/products/${id}`,
  byLister: (id: string) => `${baseUrl}/api/v1/products/lister/${id}`,
  update: (id: string) => `${baseUrl}/api/v1/products/${id}`,
  delete: (id: string) => `${baseUrl}/api/v1/products/${id}`,
  wishlist: (userId: string) => `${baseUrl}/api/v1/products/interested/${userId}`,
  historyList: (userId: string) => `${baseUrl}/api/v1/products/itemHistory/${userId}`,
  addInterest: (productId: string, buyerId: string) => `${baseUrl}/api/v1/products/${productId}/interested/${buyerId}`,
  search: `${baseUrl}/api/v1/products/search`,
};

export {
  user,
  sample,
  product,
  seller,
  chat,
};
