'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Reservation {
  id: number;
  userId: number;
  userEmail: string;
  hotelId: number;
  hotelName: string;
  propertyId: number;
  propertyTitle: string;
  roomTypeId: number;
  roomTypeName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  totalNights: number;
}

export default function MyReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/api/reservations/my-reservations');
      setReservations(response.data);
    } catch (error: any) {
      console.error('Rezervasyonlar alınamadı:', error);
      if (error.response?.status === 401) {
        setError('Giriş yapmanız gerekiyor');
        router.push('/login');
      } else {
        setError('Rezervasyonlar yüklenirken bir hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId: number) => {
    if (!confirm('Bu rezervasyonu iptal etmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await api.put(`/api/reservations/${reservationId}/cancel`);
      // Rezervasyonları yeniden yükle
      await fetchReservations();
      alert('Rezervasyon başarıyla iptal edildi');
    } catch (error: any) {
      console.error('Rezervasyon iptal edilemedi:', error);
      if (error.response?.data?.message) {
        alert(`Hata: ${error.response.data.message}`);
      } else {
        alert('Rezervasyon iptal edilirken bir hata oluştu');
      }
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">Rezervasyonlar yükleniyor...</div>
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
                className="bg-white hover:bg-gray-100 text-indigo-600 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Otel Ara
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link href="/" className="text-gray-700 hover:text-gray-900">
                  Ana Sayfa
                </Link>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span className="text-gray-500 ml-1 md:ml-2">Rezervasyonlarım</span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Sayfa Başlığı */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Rezervasyonlarım</h1>
            <p className="text-lg text-gray-600">
              Tüm rezervasyonlarınızı buradan görüntüleyebilir ve yönetebilirsiniz
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {error}
                  </h3>
                </div>
              </div>
            </div>
          )}

          {reservations.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">Henüz rezervasyonunuz bulunmuyor</div>
              <Link 
                href="/hotels" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200"
              >
                Otel Ara
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {reservations.map((reservation) => (
                <div key={reservation.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {reservation.hotelName}
                      </h3>
                      <p className="text-gray-600 mb-1">{reservation.propertyTitle}</p>
                      <p className="text-gray-600">{reservation.roomTypeName}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(reservation.status)}`}>
                        {getStatusText(reservation.status)}
                      </span>
                      <p className="text-2xl font-bold text-gray-900 mt-2">
                        {formatPrice(reservation.totalPrice)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Giriş Tarihi</p>
                      <p className="text-gray-900">{formatDate(reservation.checkIn)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Çıkış Tarihi</p>
                      <p className="text-gray-900">{formatDate(reservation.checkOut)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Misafir Sayısı</p>
                      <p className="text-gray-900">{reservation.guests} kişi</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      Rezervasyon Tarihi: {formatDate(reservation.createdAt)}
                    </div>
                    <div className="flex space-x-3">
                      <Link 
                        href={`/hotels/${reservation.hotelId}`}
                        className="text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Oteli Görüntüle
                      </Link>
                      {(reservation.status.toLowerCase() === 'pending' || reservation.status.toLowerCase() === 'confirmed') && (
                        <button
                          onClick={() => handleCancelReservation(reservation.id)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          İptal Et
                        </button>
                      )}
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
