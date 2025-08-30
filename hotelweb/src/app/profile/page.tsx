'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI, reservationsAPI } from '@/lib/api';

interface Reservation {
  id: number;
  hotelName: string;
  propertyTitle: string;
  roomTypeName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  totalNights: number;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  gender: string;
  phoneNumber: string;
  dateOfBirth: string | null;
  identityNumber: string;
  createdAt: string;
}

interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [passwordForm, setPasswordForm] = useState<ChangePasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    gender: '',
    phoneNumber: '',
    dateOfBirth: '',
    identityNumber: ''
  });
  const router = useRouter();

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      const token = localStorage.getItem('token');
      const localUser = localStorage.getItem('user');
      
      if (!token || !localUser) {
        router.push('/login');
        return;
      }

      // Önce localStorage'dan kullanıcı bilgilerini yükle
      const localUserData = JSON.parse(localUser);
      setUser({
        id: 0,
        firstName: localUserData.firstName || '',
        lastName: localUserData.lastName || '',
        email: localUserData.email || '',
        role: localUserData.role || '',
        gender: localUserData.gender || '',
        phoneNumber: localUserData.phoneNumber || '',
        dateOfBirth: localUserData.dateOfBirth || null,
        identityNumber: localUserData.identityNumber || '',
        createdAt: new Date().toISOString()
      });

      // Backend'den güncel kullanıcı bilgilerini al
      try {
        const userData = await authAPI.getCurrentUser(token);
        setUser(userData);
        // Form verilerini güncelle
        setEditForm({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          gender: userData.gender || '',
          phoneNumber: userData.phoneNumber || '',
          dateOfBirth: userData.dateOfBirth ? userData.dateOfBirth.split('T')[0] : '',
          identityNumber: userData.identityNumber || ''
        });
      } catch (userError) {
        console.warn('Backend user data fetch failed, using local data:', userError);
        // Local data ile form'u doldur
        setEditForm({
          firstName: localUserData.firstName || '',
          lastName: localUserData.lastName || '',
          email: localUserData.email || '',
          gender: localUserData.gender || '',
          phoneNumber: localUserData.phoneNumber || '',
          dateOfBirth: localUserData.dateOfBirth || '',
          identityNumber: localUserData.identityNumber || ''
        });
      }

      // Rezervasyonları al
      try {
        const reservationsData = await reservationsAPI.getMyReservations(token);
        setReservations(reservationsData);
      } catch (reservationError) {
        console.warn('Reservations fetch failed:', reservationError);
        setReservations([]);
      }
    } catch (error) {
      console.error('Profile data load error:', error);
      setError('Veri yüklenirken bir hata oluştu. Lütfen tekrar giriş yapın.');
    } finally {
      setLoading(false);
    }
  };

  const showNotificationMessage = (message: string, type: 'success' | 'error') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    
    // 5 saniye sonra bildirimi gizle
    setTimeout(() => setShowNotification(false), 5000);
  };

  const handleUpdateProfile = async () => {
    // Gerekli alanları kontrol et
    if (!editForm.firstName || !editForm.lastName || !editForm.email) {
      showNotificationMessage('Ad, Soyad ve Email alanları zorunludur', 'error');
      return;
    }

    if (!editForm.gender) {
      showNotificationMessage('Cinsiyet seçimi zorunludur', 'error');
      return;
    }

    if (!editForm.phoneNumber) {
      showNotificationMessage('Telefon numarası zorunludur', 'error');
      return;
    }

    if (!editForm.dateOfBirth) {
      showNotificationMessage('Doğum tarihi zorunludur', 'error');
      return;
    }

    if (!editForm.identityNumber || editForm.identityNumber.length !== 11) {
      showNotificationMessage('TC Kimlik No 11 haneli olmalıdır', 'error');
      return;
    }

  setUpdateLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Date formatını düzelt
      const profileData = {
        ...editForm,
        dateOfBirth: editForm.dateOfBirth + 'T00:00:00.000Z' // ISO format için
      };

      console.log('Updating profile with data:', profileData); // Debug log

      const updatedUser = await authAPI.updateProfile(profileData);
      console.log('Profile update response:', updatedUser); // Debug log
      
      setUser(updatedUser);
      
      // localStorage'ı güncelle
      localStorage.setItem('user', JSON.stringify({
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        role: updatedUser.role,
        gender: updatedUser.gender,
        phoneNumber: updatedUser.phoneNumber,
        dateOfBirth: updatedUser.dateOfBirth,
        identityNumber: updatedUser.identityNumber
      }));

      showNotificationMessage('Profil bilgileri başarıyla güncellendi!', 'success');
    } catch (error: any) {
      console.error('Profile update error:', error); // Debug log
      
      let errorMessage = 'Profil güncellenirken bir hata oluştu';
      
      if (error.response?.data) {
        // Eğer data bir object ise, JSON string'e çevir
        if (typeof error.response.data === 'object') {
          errorMessage = JSON.stringify(error.response.data);
        } else {
          errorMessage = String(error.response.data);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showNotificationMessage(errorMessage, 'error');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      showNotificationMessage('Yeni şifreler eşleşmiyor', 'error');
      return;
    }

    if (!passwordForm.currentPassword) {
      showNotificationMessage('Mevcut şifrenizi girmelisiniz', 'error');
      return;
    }

    setPasswordLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      await authAPI.changePassword(passwordForm);
      showNotificationMessage('Şifre başarıyla değiştirildi!', 'success');
      
      // Tüm şifre alanlarını temizle
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });
    } catch (error: any) {
      let errorMessage = 'Şifre değiştirilirken bir hata oluştu';
      
      if (error.response?.data) {
        // Eğer data bir object ise, JSON string'e çevir
        if (typeof error.response.data === 'object') {
          errorMessage = JSON.stringify(error.response.data);
        } else {
          errorMessage = String(error.response.data);
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showNotificationMessage(errorMessage, 'error');
      // Hata durumunda da mevcut şifreyi temizle
      setPasswordForm(prev => ({
        ...prev,
        currentPassword: ''
      }));
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId: number) => {
    if (!confirm('Bu rezervasyonu iptal etmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      await reservationsAPI.cancelReservation(reservationId, token);
      
      setReservations(prev => prev.map(res => 
        res.id === reservationId 
          ? { ...res, status: 'Cancelled' }
          : res
      ));
      alert('Rezervasyon başarıyla iptal edildi');
    } catch (error) {
      alert('Rezervasyon iptal edilirken bir hata oluştu');
      console.error('Error:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Beklemede';
      case 'confirmed':
        return 'Onaylandı';
      case 'cancelled':
        return 'İptal Edildi';
      case 'completed':
        return 'Tamamlandı';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Profil bilgileri yükleniyor...</p>
          <p className="text-sm text-gray-500 mt-2">Lütfen bekleyin</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-red-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Hata Oluştu</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button 
                onClick={checkAuthAndLoadData}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
              >
                Tekrar Dene
              </button>
              {user?.role === 'HotelOwner' ? (
                <button 
                  onClick={() => router.push('/hotel-owner')}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                >
                  Otel Sahibi Paneline Dön
                </button>
              ) : (
                <button 
                  onClick={() => router.push('/')}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                >
                  Ana Sayfaya Dön
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-indigo-600 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-white">Kullanıcı Paneli</h1>
            <div className="flex items-center space-x-4">
              <span className="text-white">
                Hoş geldin, {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email}
              </span>
              {user?.role === 'HotelOwner' ? (
                <button
                  onClick={() => router.push('/hotel-owner')}
                  className="px-4 py-2 bg-white text-indigo-600 rounded hover:bg-gray-100 transition-colors"
                >
                  Otel Sahibi Paneli
                </button>
              ) : (
                <button
                  onClick={() => router.push('/')}
                  className="px-4 py-2 bg-white text-indigo-600 rounded hover:bg-gray-100 transition-colors"
                >
                  Ana Sayfa
                </button>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sağ Tarafta Bildirim */}
        {showNotification && (
          <div className="fixed top-20 right-4 z-50 max-w-sm">
            <div className={`p-4 rounded-lg shadow-lg border-l-4 ${
              notificationType === 'success' 
                ? 'bg-green-50 border-green-400 text-green-800' 
                : 'bg-red-50 border-red-400 text-red-800'
            }`}>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {notificationType === 'success' ? (
                    <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium">{notificationMessage}</p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <button
                    onClick={() => setShowNotification(false)}
                    className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Kullanıcı Bilgileri */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Hesap Bilgileri</h2>
            <button
              onClick={handleUpdateProfile}
              disabled={updateLoading}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {updateLoading ? 'Güncelleniyor...' : 'Bilgilerimi Güncelle'}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ad</label>
              <input
                type="text"
                value={editForm.firstName}
                onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                placeholder="Adınız"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Soyad</label>
              <input
                type="text"
                value={editForm.lastName}
                onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                placeholder="Soyadınız"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                placeholder="email@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cinsiyet</label>
              <select
                value={editForm.gender}
                onChange={(e) => setEditForm({...editForm, gender: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              >
                <option value="">Seçiniz</option>
                <option value="Erkek">Erkek</option>
                <option value="Kadın">Kadın</option>
                <option value="Diğer">Diğer</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telefon Numarası</label>
              <input
                type="tel"
                value={editForm.phoneNumber}
                onChange={(e) => setEditForm({...editForm, phoneNumber: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                placeholder="0555 123 45 67"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Doğum Tarihi</label>
              <input
                type="date"
                value={editForm.dateOfBirth}
                onChange={(e) => setEditForm({...editForm, dateOfBirth: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">TC Kimlik No</label>
              <input
                type="text"
                value={editForm.identityNumber}
                onChange={(e) => setEditForm({...editForm, identityNumber: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                placeholder="12345678901"
                maxLength={11}
              />
            </div>
            
            {/* Kayıt Tarihi - Sadece Görüntüleme */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kayıt Tarihi</label>
              <p className="px-3 py-2 bg-gray-100 text-gray-900 rounded-md">
                {user?.createdAt ? formatDate(user.createdAt) : '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Şifre Değiştirme */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Şifre Değiştir</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mevcut Şifre</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                placeholder="Mevcut şifrenizi girin"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Yeni Şifre</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                placeholder="En az 6 karakter"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Yeni Şifre Tekrar</label>
              <input
                type="password"
                value={passwordForm.confirmNewPassword}
                onChange={(e) => setPasswordForm({...passwordForm, confirmNewPassword: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                placeholder="Şifrenizi tekrar girin"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleChangePassword}
              disabled={passwordLoading}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {passwordLoading ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
            </button>
          </div>
        </div>

        {/* Rezervasyonlar */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Rezervasyonlarım</h2>
          </div>
          
          {reservations.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500">Henüz rezervasyonunuz bulunmamaktadır.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {reservations.map((reservation) => (
                <div key={reservation.id} className="px-6 py-4">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {reservation.hotelName}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(reservation.status)}`}>
                          {getStatusText(reservation.status)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Tesis:</span> {reservation.propertyTitle}
                        </div>
                        <div>
                          <span className="font-medium">Oda Tipi:</span> {reservation.roomTypeName}
                        </div>
                        <div>
                          <span className="font-medium">Misafir:</span> {reservation.guests} kişi
                        </div>
                        <div>
                          <span className="font-medium">Toplam:</span> {formatPrice(reservation.totalPrice)}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mt-2">
                        <div>
                          <span className="font-medium">Giriş:</span> {formatDate(reservation.checkIn)}
                        </div>
                        <div>
                          <span className="font-medium">Çıkış:</span> {formatDate(reservation.checkOut)}
                        </div>
                        <div>
                          <span className="font-medium">Gece:</span> {reservation.totalNights}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 lg:mt-0 lg:ml-4 flex flex-col space-y-2">
                      {(reservation.status === 'Pending' || reservation.status === 'Confirmed') && (
                        <button
                          onClick={() => handleCancelReservation(reservation.id)}
                          className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                        >
                          İptal Et
                        </button>
                      )}
                      
                      <div className="text-xs text-gray-500">
                        {formatDate(reservation.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
