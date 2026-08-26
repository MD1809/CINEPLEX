import axios from 'axios';

const axiosClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor đính kèm Token
axiosClient.interceptors.request.use(
  (config) => {
    try {
      const authData = localStorage.getItem('cineplex-auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        const token = parsed?.state?.accessToken;
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch {
      // Ignore parse error
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor xử lý lỗi & token expired
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // If unauthorized, could trigger token refresh or clear storage
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
