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

interface CommissionSettings {
  id: number;
  commissionRate: number;
  minimumCommission: number;
  maximumCommission: number;
  calculationMethod: string;
  isActive: boolean;
  lastUpdated: string;
}

export default function AdminPage() {
  const [pendingHotels, setPendingHotels] = useState<PendingHotel[]>([]);
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [commissionSettings, setCommissionSettings] = useState<CommissionSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'hotels' | 'reviews' | 'commission'>('hotels');
  const [userRole, setUserRole] = useState<string>('');
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

  const fetchData = async () => {
    try {
      const [hotelsRes, reviewsRes, commissionRes] = await Promise.all([
        api.get('/api/hotels/pending'),
        api.get('/api/reviews/pending'),
        api.get('/api/commission/settings')
      ]);
      
      setPendingHotels(hotelsRes.data);
      setPendingReviews(reviewsRes.data);
      setCommissionSettings(commissionRes.data);
    } catch (error) {
      console.error('Veri alınamadı:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveHotel = async (hotelId: number) => {
    try {
      await api.post(`/api/hotels/${hotelId}/approve`, {});
      await fetchData(); // Listeyi yenile
    } catch (error) {
      console.error('Otel onaylanamadı:', error);
    }
  };

  const rejectHotel = async (hotelId: number, reason: string) => {
    try {
      await api.post(`/api/hotels/${hotelId}/reject`, { reason });
      await fetchData(); // Listeyi yenile
    } catch (error) {
      console.error('Otel reddedilemedi:', error);
    }
  };

  const approveReview = async (reviewId: number) => {
    try {
      await api.post(`/api/reviews/${reviewId}/approve`, {});
      await fetchData(); // Listeyi yenile
    } catch (error) {
      console.error('Yorum onaylanamadı:', error);
    }
  };

  const rejectReview = async (reviewId: number, reason: string) => {
    try {
      await api.post(`/api/reviews/${reviewId}/reject`, { reason });
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
              <Link href="/" className="text-xl font-bold text-white">Alkan Rezervation</Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="text-white hover:text-indigo-100 px-3 py-2 rounded-md text-sm font-medium"
              >
                Ana Sayfa
              </Link>
              <Link 
                href="/hotels" 
                className="text-white hover:text-indigo-100 px-3 py-2 rounded-md text-sm font-medium"
              >
                Oteller
              </Link>
              <Link 
                href="/admin" 
                className="text-indigo-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Admin
              </Link>
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
              <button
                onClick={() => setActiveTab('commission')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'commission'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Komisyon Ayarları
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

          {activeTab === 'commission' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Komisyon Ayarları</h2>
              {commissionSettings ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Komisyon Oranı (%)</label>
                      <p className="text-lg font-semibold">{commissionSettings.commissionRate}%</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Hesaplama Yöntemi</label>
                      <p className="text-lg font-semibold">
                        {commissionSettings.calculationMethod === 'Percentage' ? 'Yüzde' :
                         commissionSettings.calculationMethod === 'FixedAmount' ? 'Sabit Tutar' : 'Kademeli'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Minimum Komisyon</label>
                      <p className="text-lg font-semibold">{commissionSettings.minimumCommission} TL</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Maksimum Komisyon</label>
                      <p className="text-lg font-semibold">
                        {commissionSettings.maximumCommission > 0 ? `${commissionSettings.maximumCommission} TL` : 'Sınırsız'}
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-500">
                      Son güncelleme: {new Date(commissionSettings.lastUpdated).toLocaleDateString('tr-TR')}
                    </p>
                    <p className={`text-sm font-medium ${
                      commissionSettings.isActive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      Durum: {commissionSettings.isActive ? 'Aktif' : 'Pasif'}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Komisyon ayarları yüklenemedi.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
