'use client';

import { Hotel, Property, RoomType, Availability } from '@/lib/types';

interface ReservationSummaryProps {
  hotel: Hotel;
  property: Property;
  selectedRoomType: RoomType | null;
  reservationData: {
    checkIn: string;
    checkOut: string;
    guests: number;
    roomTypeId: number;
    totalPrice: number;
    nights: number;
  };
  availabilities: Availability[];
}

export function ReservationSummary({ 
  hotel, 
  property, 
  selectedRoomType, 
  reservationData, 
  availabilities 
}: ReservationSummaryProps) {
  // Seçili oda tipi için gece başına fiyat
  const getPricePerNight = () => {
    if (!selectedRoomType) return 0;
    const availability = availabilities.find(a => a.roomTypeId === selectedRoomType.id);
    return availability ? availability.price : selectedRoomType.price;
  };

  const pricePerNight = getPricePerNight();

  // Vergi hesaplama (KDV %18)
  const taxRate = 0.18;
  const subtotal = reservationData.totalPrice;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return (
    <div className="space-y-6">
      {/* Rezervasyon Özeti */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rezervasyon Özeti</h3>
          
          {/* Otel Bilgileri */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{hotel.name}</h4>
                <p className="text-sm text-gray-600">{property.title}</p>
              </div>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {hotel.city}
            </div>
          </div>

          {/* Tarih ve Kişi Bilgileri */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Giriş Tarihi:</span>
              <span className="font-medium">
                {new Date(reservationData.checkIn).toLocaleDateString('tr-TR')}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Çıkış Tarihi:</span>
              <span className="font-medium">
                {new Date(reservationData.checkOut).toLocaleDateString('tr-TR')}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Kişi Sayısı:</span>
              <span className="font-medium">{reservationData.guests} kişi</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Toplam Gece:</span>
              <span className="font-medium">{reservationData.nights} gece</span>
            </div>
          </div>

          {/* Seçili Oda Tipi */}
          {selectedRoomType && (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Seçili Oda</h4>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{selectedRoomType.name}</p>
                  <p className="text-sm text-gray-600">{selectedRoomType.capacity} kişi</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-indigo-600">
                    ₺{pricePerNight}
                  </div>
                  <div className="text-sm text-gray-500">gece</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fiyat Detayları */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Fiyat Detayları</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {pricePerNight} ₺ × {reservationData.nights} gece
              </span>
              <span className="font-medium">₺{subtotal}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">KDV (%18)</span>
              <span className="font-medium">₺{tax.toFixed(2)}</span>
            </div>
            
            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900">Toplam</span>
                <span className="text-2xl font-bold text-indigo-600">₺{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Ödeme Bilgisi */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center text-sm text-blue-800">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Ödeme bilgileri rezervasyon tamamlandıktan sonra e-posta ile gönderilecektir</span>
            </div>
          </div>
        </div>
      </div>

      {/* İptal Politikası */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">İptal Politikası</h3>
          
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Giriş tarihinden 24 saat öncesine kadar ücretsiz iptal</span>
            </div>
            
            <div className="flex items-start space-x-2">
              <svg className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>24 saatten az sürede iptal durumunda 1 gece ücreti alınır</span>
            </div>
            
            <div className="flex items-start space-x-2">
              <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>Giriş tarihinde iptal durumunda tam ücret alınır</span>
            </div>
          </div>
        </div>
      </div>

      {/* Güvenlik ve Güven */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Güvenlik ve Güven</h3>
          
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>SSL şifreleme ile güvenli ödeme</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Anında rezervasyon onayı</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>7/24 müşteri desteği</span>
            </div>
          </div>
        </div>
      </div>

      {/* Yardım */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="text-center">
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
  );
}
