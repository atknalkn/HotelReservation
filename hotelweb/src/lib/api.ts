import axios from 'axios';

export const api = axios.create({ 
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5164',
  timeout: 10000, // 10 saniye timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor - JWT token ekle
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - hata yönetimi
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token süresi dolmuş veya geçersiz
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API fonksiyonları
export const authAPI = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/api/Auth/login', credentials);
    return response.data;
  },
  
  register: async (userData: { firstName: string; lastName: string; email: string; password: string; confirmPassword: string; role: string }) => {
    const response = await api.post('/api/Auth/register', userData);
    return response.data;
  },
  
  getCurrentUser: async (token: string) => {
    const response = await api.get('/api/Auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  updateProfile: async (profileData: { firstName: string; lastName: string; email: string; gender: string; phoneNumber: string; dateOfBirth: string; identityNumber: string }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token bulunamadı');
      }
      
      console.log('Sending profile update request:', profileData); // Debug log
      
      const response = await api.put('/api/Auth/profile', profileData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Profile update API response:', response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error('Profile update API error:', error); // Debug log
      throw error;
    }
  },

  changePassword: async (passwordData: { currentPassword: string; newPassword: string; confirmNewPassword: string }) => {
    const token = localStorage.getItem('token');
    const response = await api.put('/api/Auth/change-password', passwordData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};

export const reservationsAPI = {
  getMyReservations: async (token: string) => {
    const response = await api.get('/api/Reservations/my-reservations', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  
  cancelReservation: async (reservationId: number, token: string) => {
    const response = await api.put(`/api/Reservations/${reservationId}/cancel`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};

// Hotel Owner API functions
export const hotelOwnerAPI = {
  // Hotel management
  getMyHotels: async (token: string) => {
    const response = await api.get('/api/hotels/my-hotels', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  createHotel: async (hotelData: any, token: string) => {
    const response = await api.post('/api/hotels', hotelData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  updateHotel: async (hotelId: number, hotelData: any, token: string) => {
    const response = await api.put(`/api/hotels/${hotelId}`, hotelData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  deleteHotel: async (hotelId: number, token: string) => {
    const response = await api.delete(`/api/hotels/${hotelId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  getHotelDashboard: async (hotelId: number, token: string) => {
    const response = await api.get(`/api/hotels/${hotelId}/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Property management
  getMyProperties: async (token: string) => {
    const response = await api.get('/api/properties/my-properties', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  createProperty: async (propertyData: any, token: string) => {
    const response = await api.post('/api/properties', propertyData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  updateProperty: async (propertyId: number, propertyData: any, token: string) => {
    const response = await api.put(`/api/properties/${propertyId}`, propertyData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  deleteProperty: async (propertyId: number, token: string) => {
    const response = await api.delete(`/api/properties/${propertyId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Room type management
  getMyRoomTypes: async (token: string) => {
    const response = await api.get('/api/roomtypes/my-room-types', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  createRoomType: async (roomTypeData: any, token: string) => {
    const response = await api.post('/api/roomtypes', roomTypeData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  updateRoomType: async (roomTypeId: number, roomTypeData: any, token: string) => {
    const response = await api.put(`/api/roomtypes/${roomTypeId}`, roomTypeData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  deleteRoomType: async (roomTypeId: number, token: string) => {
    const response = await api.delete(`/api/roomtypes/${roomTypeId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Availability management
  getMyAvailabilities: async (token: string) => {
    const response = await api.get('/api/availabilities/my-availabilities', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  createAvailability: async (availabilityData: any, token: string) => {
    const response = await api.post('/api/availabilities', availabilityData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  updateAvailability: async (availabilityId: number, availabilityData: any, token: string) => {
    const response = await api.put(`/api/availabilities/${availabilityId}`, availabilityData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  deleteAvailability: async (availabilityId: number, token: string) => {
    const response = await api.delete(`/api/availabilities/${availabilityId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Reservation tracking
  getReservationsByHotel: async (hotelId: number, token: string) => {
    const response = await api.get(`/api/reservations/hotel/${hotelId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};