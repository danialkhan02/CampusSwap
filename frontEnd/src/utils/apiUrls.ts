const baseUrl = process.env.REACT_APP_SERVER_URL as string;

const sample = {
  status: `${baseUrl}/status`,
};

const user = {
  details: `${baseUrl}/api/v1/users`,
  create: `${baseUrl}/api/v1/users`,
};

export {
  user, sample,
};
