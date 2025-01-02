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
  return localStorage.getItem('token');
};

// Function to set auth token
export const setAuthToken = (token: string) => {
  if (!isBrowser) {
    console.warn('Not in browser environment, cannot access localStorage');
    return;
  }
  localStorage.setItem('token', token.trim());
};

// Function to clear auth token
export const clearAuthToken = () => {
  if (!isBrowser) {
    console.warn('Not in browser environment, cannot access localStorage');
    return;
  }
  localStorage.removeItem('token');
};