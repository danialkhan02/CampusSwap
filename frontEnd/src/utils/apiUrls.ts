const baseUrl = process.env.REACT_APP_SERVER_URL as string;

const sample = {
  status: `${baseUrl}/status`,
};

const user = {
  details: `${baseUrl}/api/v1/users`,
  create: `${baseUrl}/api/v1/users`,
};

const product = {
  list: `${baseUrl}/api/v1/products/list`,
  create: `${baseUrl}/api/v1/products/create`,
  details: (id: string) => `${baseUrl}/api/v1/products/${id}`,
  byLister: (id: string) => `${baseUrl}/api/v1/products/lister/${id}`,
  update: (id: string) => `${baseUrl}/api/v1/products/${id}`,
  delete: (id: string) => `${baseUrl}/api/v1/products/${id}`,
  wishlist: (userId: string) => `${baseUrl}/api/v1/products/interested/${userId}`,
  addInterest: (productId: string, buyerId: string) => `${baseUrl}/api/v1/products/${productId}/interested/${buyerId}`,
};

export {
  user,
  sample,
  product,
};
