import AsyncStorage from '@react-native-async-storage/async-storage';

let token: string | null = null;

export const setAuthToken = (t: string | null) => {
  token = t;
};

export const getAuthToken = () => token;

export const hydrateAuthSession = async () => {
  try {
    const [storedToken, storedRole] = await Promise.all([
      AsyncStorage.getItem('token'),
      AsyncStorage.getItem('role'),
    ]);

    token = storedToken ?? null;

    return {
      token: token,
      role: storedRole ?? null,
    };
  } catch (error) {
    token = null;
    return { token: null, role: null };
  }
};

export const setAuthSession = async (newToken: string, role?: string) => {
  token = newToken;

  await Promise.all([
    AsyncStorage.setItem('token', newToken),
    ...(role ? [AsyncStorage.setItem('role', role)] : []),
  ]);
};

export const clearAuthSession = async () => {
  token = null;
  await AsyncStorage.multiRemove(['token', 'role']);
};

export const clearAuthToken = () => {
  token = null;
};
