const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://forextrading-athi.onrender.com/api');

const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('API Error Response:', data);
    throw new Error(data.error?.stack || data.error?.message || 'API Request Failed');
  }

  return data;
};
