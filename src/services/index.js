import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

export const eventService = {
  getAll: (params) => api.get('/events', { params }),
  getMy: () => api.get('/events/my'),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
  getByCategory: (category) => api.get(`/events/category/${category}`)
};

export const vendorService = {
  getAll: (params) => api.get('/vendors', { params }),
  getById: (id) => api.get(`/vendors/${id}`),
  getByCategory: (category) => api.get(`/vendors/category/${category}`),
  getServices: (id) => api.get(`/vendors/${id}/services`),
  create: (data) => api.post('/vendors', data),
  update: (data) => api.put('/vendors', data)
};

export const serviceService = {
  getAll: (params) => api.get('/services', { params }),
  getById: (id) => api.get(`/services/${id}`),
  getByCategory: (category) => api.get(`/services/category/${category}`),
  search: (params) => api.get('/services/search', { params })
};

export const bookingService = {
  getAll: (params) => api.get('/bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  getByEvent: (eventId) => api.get(`/bookings/event/${eventId}`),
  create: (data) => api.post('/bookings', data),
  update: (id, data) => api.put(`/bookings/${id}`, data),
  updateStatus: (id, status) => api.put(`/bookings/${id}/status`, { status })
};

export const paymentService = {
  create: (data) => api.post('/payments', data),
  getById: (id) => api.get(`/payments/${id}`),
  getByUser: (userId) => api.get(`/payments/user/${userId}`),
  getInvoice: (id) => api.get(`/payments/${id}/invoice`)
};

export const guestService = {
  getByEvent: (eventId, params) => api.get(`/guests/event/${eventId}`, { params }),
  create: (data) => api.post('/guests', data),
  bulkInvite: (data) => api.post('/guests/bulk', data),
  update: (id, data) => api.put(`/guests/${id}`, data),
  updateStatus: (id, status) => api.put(`/guests/${id}/status`, { status })
};

export const reviewService = {
  getByVendor: (vendorId, params) => api.get(`/reviews/vendor/${vendorId}`, { params }),
  create: (data) => api.post('/reviews', data),
  getAverage: (vendorId) => api.get(`/reviews/vendor/${vendorId}/average`)
};

export const aiPlannerService = {
  generatePlan: (data) => api.post('/ai-planner/plan', data),
  getTemplates: () => api.get('/ai-planner/templates')
};

export const notificationService = {
  getByUser: (userId, params) => api.get(`/notifications/user/${userId}`, { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: (userId) => api.put(`/notifications/user/${userId}/read-all`)
};

export const adminService = {
  getUsers: (params) => api.get('/admin/users', { params }),
  getVendors: (params) => api.get('/admin/vendors', { params }),
  getAnalytics: (params) => api.get('/admin/analytics', { params }),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role })
};