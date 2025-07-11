export const AUTH_KEYS = {
  TOKEN: 'auth_token',
  USER_ID: 'user_id',
  USER_DATA: 'user_data',
};

export const storeAuthData = (token, userId, userData) => {
  try {
    localStorage.setItem(AUTH_KEYS.TOKEN, token);
    localStorage.setItem(AUTH_KEYS.USER_ID, userId.toString());
    localStorage.setItem(AUTH_KEYS.USER_DATA, JSON.stringify(userData));
  } catch (error) {
    console.error('Error storing auth data:', error);
    throw error;
  }
};

export const getAuthToken = () => {
  try {
    return localStorage.getItem(AUTH_KEYS.TOKEN);
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

export const getUserData = () => {
  try {
    const userData = localStorage.getItem(AUTH_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

export const clearAuthData = () => {
  try {
    localStorage.removeItem(AUTH_KEYS.TOKEN);
    localStorage.removeItem(AUTH_KEYS.USER_ID);
    localStorage.removeItem(AUTH_KEYS.USER_DATA);
  } catch (error) {
    console.error('Error clearing auth data:', error);
    throw error;
  }
};

export const isAuthenticated = () => {
  try {
    const token = getAuthToken();
    return !!token;
  } catch (error) {
    return false;
  }
}; 