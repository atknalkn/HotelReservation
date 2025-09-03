'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import Link from 'next/link';

interface ReservationSuccessData {
  id: number;
  hotelName: string;
  propertyTitle: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: string;
  createdAt: string;
}

export default function ReservationSuccessPage() {
  const searchParams = useSearchParams();
  const reservationId = searchParams.get('id');
  
  const [reservation, setReservation] = useState<ReservationSuccessData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (reservationId) {
      fetchReservationDetails();
    }
  }, [reservationId]);

  const fetchReservationDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/reservations/${reservationId}`);
      setReservation(response.data);
    } catch (error) {
      console.error('Rezervasyon detayları alınamadı:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">Rezervasyon bilgileri yükleniyor...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">Rezervasyon bulunamadı</div>
              <Link href="/" className="text-indigo-600 hover:text-indigo-800 font-medium mt-4 inline-block">
                Ana sayfaya dön
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
                className="bg-white hover:bg-gray-100 text-indigo-600 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Otel Ara
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Başarı Mesajı */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Rezervasyon Başarılı!</h1>
            <p className="text-lg text-gray-600">
              Rezervasyonunuz başarıyla oluşturuldu. Detaylar aşağıda yer almaktadır.
            </p>
          </div>

          {/* Rezervasyon Detayları */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Rezervasyon Detayları</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sol Taraf */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rezervasyon No</label>
                    <p className="text-lg font-bold text-black">#{reservation.id}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Otel</label>
                    <p className="text-lg font-bold text-black">{reservation.hotelName}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
                    <p className="text-lg font-bold text-black">{reservation.propertyTitle}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kişi Sayısı</label>
                    <p className="text-lg font-bold text-black">{reservation.guests} kişi</p>
                  </div>
                </div>

                {/* Sağ Taraf */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giriş Tarihi</label>
                    <p className="text-lg font-bold text-black">
                      {new Date(reservation.checkIn).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Çıkış Tarihi</label>
                    <p className="text-lg font-bold text-black">
                      {new Date(reservation.checkOut).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Toplam Fiyat</label>
                    <p className="text-2xl font-bold text-indigo-600">₺{reservation.totalPrice}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {reservation.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tarih Bilgisi */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-center text-sm text-gray-500">
                  Rezervasyon Tarihi: {new Date(reservation.createdAt).toLocaleDateString('tr-TR')} - {new Date(reservation.createdAt).toLocaleTimeString('tr-TR')}
                </div>
              </div>
            </div>
          </div>

          {/* Sonraki Adımlar */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Sonraki Adımlar</h3>
            
            <div className="space-y-3 text-sm text-blue-800">
              <div className="flex items-start space-x-2">
                <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Rezervasyon onayınız e-posta adresinize gönderilecektir</span>
              </div>
              
              <div className="flex items-start space-x-2">
                <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Giriş tarihinden 24 saat öncesine kadar rezervasyonunuzu iptal edebilirsiniz</span>
              </div>
              
              <div className="flex items-start space-x-2">
                <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Herhangi bir sorunuz olursa müşteri hizmetlerimizle iletişime geçebilirsiniz</span>
              </div>
            </div>
          </div>

          {/* Aksiyon Butonları */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-center"
            >
              Ana Sayfaya Dön
            </Link>
            
            <Link
              href="/hotels"
              className="px-6 py-3 bg-white text-indigo-600 border border-indigo-600 font-medium rounded-lg hover:bg-indigo-50 transition-colors duration-200 text-center"
            >
              Başka Otel Ara
            </Link>
          </div>

          {/* İletişim Bilgileri */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 mb-2">Yardıma mı ihtiyacınız var?</p>
            <div className="flex items-center justify-center space-x-4 text-sm">
              <a href="tel:+905551234567" className="text-indigo-600 hover:text-indigo-800 font-medium">
                📞 +90 555 123 45 67
              </a>
              <a href="mailto:destek@alkanrezervation.com" className="text-indigo-600 hover:text-indigo-800 font-medium">
                ✉️ destek@alkanrezervation.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
