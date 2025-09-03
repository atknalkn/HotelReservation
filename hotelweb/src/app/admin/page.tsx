'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

interface PendingHotel {
  id: number;
  name: string;
  city: string;
  address: string;
  ownerUserEmail: string;
  createdAt: string;
}

interface PendingReview {
  id: number;
  hotelName: string;
  userEmail: string;
  overallRating: number;
  comment: string;
  createdAt: string;
}

export default function AdminPage() {
  const [pendingHotels, setPendingHotels] = useState<PendingHotel[]>([]);
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'hotels' | 'reviews'>('hotels');
  const [userRole, setUserRole] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuthAndRedirect();
  }, []);

  const checkAuthAndRedirect = async () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(user);
    setUserRole(userData.role);
    setUserName(userData.firstName && userData.lastName ? `${userData.firstName} ${userData.lastName}` : userData.email || 'Admin');

    // Hotel owner'ları kendi panellerine yönlendir
    if (userData.role === 'HotelOwner') {
      router.push('/hotel-owner');
      return;
    }

    // Sadece admin'ler bu sayfaya erişebilir
    if (userData.role !== 'Admin') {
      router.push('/');
      return;
    }

    await fetchData();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUserRole('');
    setUserName('');
    setIsDropdownOpen(false);
    router.push('/login');
  };

  const fetchData = async () => {
    try {
      console.log('API çağrıları başlıyor...');
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token bulunamadı');
        return;
      }
      
      const hotelsRes = await api.get('/api/hotels/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Hotels API başarılı:', hotelsRes.data);
      
      const reviewsRes = await api.get('/api/reviews/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Reviews API başarılı:', reviewsRes.data);
      
      setPendingHotels(hotelsRes.data);
      setPendingReviews(reviewsRes.data);
    } catch (error: any) {
      console.error('API hatası detayı:', error);
      console.error('Hata mesajı:', error.message);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      console.error('Response headers:', error.response?.headers);
    } finally {
      setLoading(false);
    }
  };

  const approveHotel = async (hotelId: number) => {
    try {
      const token = localStorage.getItem('token');
      await api.post(`/api/hotels/${hotelId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchData(); // Listeyi yenile
    } catch (error) {
      console.error('Otel onaylanamadı:', error);
    }
  };

  const rejectHotel = async (hotelId: number, reason: string) => {
    try {
      const token = localStorage.getItem('token');
      await api.post(`/api/hotels/${hotelId}/reject`, { reason }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchData(); // Listeyi yenile
    } catch (error) {
      console.error('Otel reddedilemedi:', error);
    }
  };

  const deleteHotel = async (hotelId: number) => {
    if (window.confirm('Bu oteli silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      try {
        const token = localStorage.getItem('token');
        await api.delete(`/api/hotels/${hotelId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        await fetchData(); // Listeyi yenile
      } catch (error) {
        console.error('Otel silinemedi:', error);
      }
    }
  };

  const approveReview = async (reviewId: number) => {
    try {
      const token = localStorage.getItem('token');
      await api.post(`/api/reviews/${reviewId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchData(); // Listeyi yenile
    } catch (error) {
      console.error('Yorum onaylanamadı:', error);
    }
  };

  const rejectReview = async (reviewId: number, reason: string) => {
    try {
      const token = localStorage.getItem('token');
      await api.post(`/api/reviews/${reviewId}/reject`, { reason }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchData(); // Listeyi yenile
    } catch (error) {
      console.error('Yorum reddedilemedi:', error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Paneli</h1>
            <div className="text-center">Yükleniyor...</div>
          </div>
        </div>
      </div>
    );
  }

  // Role check
  if (userRole !== 'Admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Erişim Reddedildi</h1>
            <p className="text-center text-gray-600">
              Bu sayfaya erişim yetkiniz bulunmamaktadır.
            </p>
            <div className="text-center mt-4">
              <Link 
                href="/" 
                className="text-blue-600 hover:text-blue-700"
              >
                Ana Sayfaya Dön
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-indigo-600 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-white">Alkan Rezervation</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center text-white hover:text-indigo-100 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <span>{userName}</span>
                  <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Paneli</h1>
          
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('hotels')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'hotels'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Onay Bekleyen Oteller ({pendingHotels.length})
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'reviews'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Onay Bekleyen Yorumlar ({pendingReviews.length})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'hotels' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Onay Bekleyen Oteller</h2>
              {pendingHotels.length > 0 ? (
                <div className="space-y-4">
                  {pendingHotels.map((hotel) => (
                    <div key={hotel.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{hotel.name}</h3>
                          <p className="text-gray-600">{hotel.city}</p>
                          <p className="text-sm text-gray-500">{hotel.address}</p>
                          <p className="text-xs text-gray-400">Sahip: {hotel.ownerUserEmail}</p>
                          <p className="text-xs text-gray-400">
                            Başvuru: {new Date(hotel.createdAt).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => approveHotel(hotel.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Onayla
                          </button>
                          <button
                            onClick={() => rejectHotel(hotel.id, 'Admin tarafından reddedildi')}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Reddet
                          </button>
                          <button
                            onClick={() => deleteHotel(hotel.id)}
                            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                          >
                            Sil
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Onay bekleyen otel bulunmuyor.
                </p>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Onay Bekleyen Yorumlar</h2>
              {pendingReviews.length > 0 ? (
                <div className="space-y-4">
                  {pendingReviews.map((review) => (
                    <div key={review.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold">{review.hotelName}</h3>
                          <div className="flex items-center space-x-2 my-2">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`text-sm ${
                                i < review.overallRating ? 'text-yellow-400' : 'text-gray-300'
                              }`}>
                                ★
                              </span>
                            ))}
                          </div>
                          <p className="text-gray-700 mb-2">{review.comment}</p>
                          <p className="text-xs text-gray-500">Kullanıcı: {review.userEmail}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(review.createdAt).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => approveReview(review.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Onayla
                          </button>
                          <button
                            onClick={() => rejectReview(review.id, 'Admin tarafından reddedildi')}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Reddet
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Onay bekleyen yorum bulunmuyor.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
