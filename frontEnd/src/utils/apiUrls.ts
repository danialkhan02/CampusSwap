const baseUrl = process.env.REACT_APP_SERVER_URL as string;

const sample = {
  status: `${baseUrl}/status`,
};

const user = {
  details: `${baseUrl}/api/v1/users`,
  create: `${baseUrl}/api/v1/users`,
};

const product = {
  list: `${baseUrl}/api/v1/product/list`,
  create: `${baseUrl}/api/v1/product/create`,
  details: (id: string) => `${baseUrl}/api/v1/product/${id}`,
  byLister: (id: string) => `${baseUrl}/api/v1/product/lister/${id}`,
  update: (id: string) => `${baseUrl}/api/v1/product/${id}`,
  delete: (id: string) => `${baseUrl}/api/v1/product/${id}`,
  addInterest: (productId: string, buyerId: string) => 
    `${baseUrl}/api/v1/product/${productId}/interested/${buyerId}`,
};

export {
  user, sample, product,
};