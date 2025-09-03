'use client';

import { RoomType, Availability } from '@/lib/types';

interface RoomListProps {
  roomTypes: RoomType[];
  availabilities: Availability[];
  selectedDates: {
    checkIn: string;
    checkOut: string;
    guests: number;
  };
}

export function RoomList({ roomTypes, availabilities, selectedDates }: RoomListProps) {
  // Seçili tarihler için availability hesapla
  const getAvailabilityForRoomType = (roomTypeId: number) => {
    if (!selectedDates.checkIn || !selectedDates.checkOut) {
      return { available: false, price: 0, totalPrice: 0 };
    }

    const checkIn = new Date(selectedDates.checkIn);
    const checkOut = new Date(selectedDates.checkOut);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    // Bu oda tipi için seçili tarih aralığındaki availability'leri bul
    const roomAvailabilities = availabilities.filter(a => 
      a.roomTypeId === roomTypeId &&
      new Date(a.date) >= checkIn &&
      new Date(a.date) < checkOut
    );
    
    // Tüm geceler için stok var mı kontrol et
    const hasAvailability = roomAvailabilities.length === nights && 
                           roomAvailabilities.every(a => a.stock >= selectedDates.guests);
    
    if (hasAvailability && roomAvailabilities.length > 0) {
      // Ortalama fiyat hesapla
      const totalPrice = roomAvailabilities.reduce((sum, a) => sum + (a.priceOverride || a.basePrice), 0);
      const averagePrice = totalPrice / nights;
      
      return {
        available: true,
        price: averagePrice,
        totalPrice: totalPrice,
        nights
      };
    }

    return { available: false, price: 0, totalPrice: 0 };
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Oda Tipleri</h2>
        
        {roomTypes.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Bu property için henüz oda tipi tanımlanmamış.</div>
          </div>
        ) : (
          <div className="space-y-4">
            {roomTypes.map((roomType) => {
              const availability = getAvailabilityForRoomType(roomType.id);
              
              return (
                <div
                  key={roomType.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{roomType.name}</h3>
                        <div className="text-right">
                          {availability.available ? (
                            <div>
                              <div className="text-2xl font-bold text-indigo-600">
                                ₺{availability.price}
                              </div>
                              <div className="text-sm text-gray-500">gece</div>
                            </div>
                          ) : (
                            <div className="text-red-600 font-medium">Müsait değil</div>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{roomType.description}</p>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {roomType.capacity} kişi
                        </div>
                        
                        {availability.available && selectedDates.checkIn && selectedDates.checkOut && (
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {availability.nights} gece
                          </div>
                        )}
                      </div>
                      
                      {availability.available && selectedDates.checkIn && selectedDates.checkOut && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Toplam Fiyat:</span>
                            <span className="text-lg font-semibold text-gray-900">
                              ₺{availability.totalPrice}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 text-right">
                            {availability.price} × {availability.nights} gece
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Oda Görseli */}
                    <div className="ml-4">
                      <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                        <div className="text-center text-gray-400">
                          <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <p className="text-xs">Oda</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Aksiyon Butonları */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {availability.available ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <svg className="w-2 h-2 mr-1" fill="currentColor" viewBox="0 0 8 8">
                            <circle cx="4" cy="4" r="3" />
                          </svg>
                          Müsait
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <svg className="w-2 h-2 mr-1" fill="currentColor" viewBox="0 0 8 8">
                            <circle cx="4" cy="4" r="3" />
                          </svg>
                          Müsait değil
                        </span>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200 text-sm">
                        Detayları Gör
                      </button>
                      
                                             {availability.available && selectedDates.checkIn && selectedDates.checkOut && (
                         <button 
                           onClick={() => {
                             const queryParams = new URLSearchParams({
                               hotelId: '1', // Bu değer parent component'ten gelmeli
                               propertyId: '1', // Bu değer parent component'ten gelmeli
                               checkIn: selectedDates.checkIn,
                               checkOut: selectedDates.checkOut,
                               guests: selectedDates.guests.toString()
                             });
                             window.location.href = `/reservation?${queryParams.toString()}`;
                           }}
                           className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 text-sm font-medium"
                         >
                           Rezervasyon Yap
                         </button>
                       )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Tarih Seçimi Uyarısı */}
        {(!selectedDates.checkIn || !selectedDates.checkOut) && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium">Fiyatları görmek için tarih seçin</p>
                <p className="text-blue-600">Sağ taraftaki takvimden giriş ve çıkış tarihlerini belirleyin</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
