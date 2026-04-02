import api from './api';

export const documentService = {
  upload: (formData) => api.post('/documents/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getByEvent: (eventId) => api.get(`/documents/event/${eventId}`),
  delete: (id) => api.delete(`/documents/${id}`)
};

export const messageService = {
  send: (data) => api.post('/messages/send', data),
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (contactId) => api.get(`/messages/contact/${contactId}`),
  getEventMessages: (eventId) => api.get(`/messages/event/${eventId}`)
};

export const hotelService = {
  getAll: (params) => api.get('/hotels', { params }),
  getById: (id) => api.get(`/hotels/${id}`),
  create: (data) => api.post('/hotels', data),
  update: (id, data) => api.put(`/hotels/${id}`, data),
  delete: (id) => api.delete(`/hotels/${id}`)
};

export const restaurantService = {
  getAll: (params) => api.get('/restaurants', { params }),
  getById: (id) => api.get(`/restaurants/${id}`),
  create: (data) => api.post('/restaurants', data),
  update: (id, data) => api.put(`/restaurants/${id}`, data),
  delete: (id) => api.delete(`/restaurants/${id}`)
};

export const templateService = {
  getAll: (params) => api.get('/templates', { params }),
  getById: (id) => api.get(`/templates/${id}`)
};

export const promoService = {
  getAll: (params) => api.get('/promo', { params }),
  getMy: () => api.get('/promo/my'),
  create: (data) => api.post('/promo', data),
  validate: (code, amount) => api.get(`/promo/validate/${code}`, { params: { amount } }),
  use: (code) => api.post(`/promo/${code}/use`)
};

export const wishlistService = {
  getByEvent: (eventId) => api.get(`/wishlist/event/${eventId}`),
  create: (data) => api.post('/wishlist', data),
  claim: (id) => api.post(`/wishlist/${id}/claim`),
  delete: (id) => api.delete(`/wishlist/${id}`)
};

export const attendanceService = {
  generateQR: (data) => api.post('/attendance/generate', data),
  checkIn: (qrCode) => api.post('/attendance/check-in', { qr_code: qrCode }),
  checkOut: (qrCode) => api.post('/attendance/check-out', { qr_code: qrCode }),
  getByEvent: (eventId) => api.get(`/attendance/event/${eventId}`),
  generateAll: (eventId) => api.post(`/attendance/generate-all/${eventId}`)
};