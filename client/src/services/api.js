import axios from 'axios';

const apiInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api'
});

apiInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const api = {
  auth: {
    login: (username, password) => apiInstance.post('/auth/login', { username, password }),
    getMe: () => apiInstance.get('/auth/me')
  },
  employees: {
    getAll: () => apiInstance.get('/employees'),
    create: (data) => apiInstance.post('/employees', data),
    update: (id, data) => apiInstance.put(`/employees/${id}`, data),
    delete: (id) => apiInstance.delete(`/employees/${id}`)
  },
  shops: {
    getAll: () => apiInstance.get('/shops'),
    create: (data) => apiInstance.post('/shops', data),
    update: (id, data) => apiInstance.put(`/shops/${id}`, data),
    delete: (id) => apiInstance.delete(`/shops/${id}`)
  },
  companies: {
    getAll: () => apiInstance.get('/companies'),
    create: (data) => apiInstance.post('/companies', data),
    update: (id, data) => apiInstance.put(`/companies/${id}`, data),
    delete: (id) => apiInstance.delete(`/companies/${id}`)
  },
  entries: {
    getAll: (params) => apiInstance.get('/entries', { params }),
    create: (data) => apiInstance.post('/entries', data),
    update: (id, data) => apiInstance.put(`/entries/${id}`, data),
    delete: (id) => apiInstance.delete(`/entries/${id}`)
  },
  reports: {
    getDashboard: () => apiInstance.get('/reports/dashboard'),
    getEmployeeReport: (id) => apiInstance.get(`/reports/employee/${id}`),
    getMonthlyReport: (month, year) => apiInstance.get('/reports/monthly', { params: { month, year } }),
    getOutstanding: () => apiInstance.get('/reports/outstanding')
  },
  payments: {
    getAll: (params) => apiInstance.get('/payments', { params }),
    create: (data) => apiInstance.post('/payments', data)
  }
};

export default api;
