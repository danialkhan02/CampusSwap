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
  details: (productId: string) => `${baseUrl}/api/v1/product/${productId}`,
};

export {
  user, sample, product,
};
