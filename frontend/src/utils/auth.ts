// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined' && window.localStorage;

// Function to handle auth errors and logout
export const handleAuthError = () => {
  console.log('Authentication error, logging out...');
  if (isBrowser) {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
};

// Function to get auth token
export const getAuthToken = () => {
  if (!isBrowser) {
    console.warn('Not in browser environment, cannot access localStorage');
    return null;
  }
  const token = localStorage.getItem('token');
  console.log('Getting auth token:', token ? `${token.substring(0, 20)}...` : 'no token');
  return token;
};

// Function to set auth token
export const setAuthToken = (token: string) => {
  if (!isBrowser) {
    console.warn('Not in browser environment, cannot access localStorage');
    return;
  }
  if (!token) {
    console.warn('Attempting to set empty token');
    return;
  }
  const trimmedToken = token.trim();
  console.log('Setting auth token:', trimmedToken.substring(0, 20) + '...');
  localStorage.setItem('token', trimmedToken);
};

// Function to clear auth token
export const clearAuthToken = () => {
  if (!isBrowser) {
    console.warn('Not in browser environment, cannot access localStorage');
    return;
  }
  console.log('Clearing auth token');
  localStorage.removeItem('token');
};