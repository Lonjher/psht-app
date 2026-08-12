let token: any | null = null;

export const setAuthToken = (t: any) => {
  token = t;
};

export const getAuthToken = () => token;

export const clearAuthToken = () => {
  token = null;
};
