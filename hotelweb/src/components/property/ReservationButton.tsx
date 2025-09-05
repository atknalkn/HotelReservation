'use client';

import { useState } from 'react';
import { Hotel, Property } from '@/lib/types';

interface ReservationButtonProps {
  hotel: Hotel;
  property: Property | null;
  selectedDates: {
    checkIn: string;
    checkOut: string;
    guests: number;
  };
  onDateChange: (dates: { checkIn: string; checkOut: string; guests: number }) => void;
}

export function ReservationButton({ hotel, property, selectedDates, onDateChange }: ReservationButtonProps) {
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);

  // Rezervasyon için gerekli bilgilerin tam olup olmadığını kontrol et
  const canMakeReservation = property && selectedDates.checkIn && selectedDates.checkOut && selectedDates.guests > 0;

  // Toplam gece sayısını hesapla
  const getTotalNights = () => {
    if (!selectedDates.checkIn || !selectedDates.checkOut) return 0;
    const checkIn = new Date(selectedDates.checkIn);
    const checkOut = new Date(selectedDates.checkOut);
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  };

  const totalNights = getTotalNights();

  // Rezervasyon modal'ını aç
  const openReservationModal = () => {
    if (canMakeReservation) {
      setIsReservationModalOpen(true);
    }
  };

  // Rezervasyon modal'ını kapat
  const closeReservationModal = () => {
    setIsReservationModalOpen(false);
  };

  // Rezervasyon işlemini başlat
  const startReservation = () => {
    // Modal'ı kapat
    closeReservationModal();
    
    // Rezervasyon sayfasına yönlendir
    if (!property) return;
    
    const queryParams = new URLSearchParams({
      hotelId: hotel.id.toString(),
      propertyId: property.id.toString(),
      checkIn: selectedDates.checkIn,
      checkOut: selectedDates.checkOut,
      guests: selectedDates.guests.toString()
    });
    
    window.location.href = `/reservation?${queryParams.toString()}`;
  };

  return (
    <>
      {/* Ana Rezervasyon Butonu */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rezervasyon</h3>
          
          {!canMakeReservation ? (
            <div className="text-center py-6">
              <div className="text-gray-500 mb-4">
                Rezervasyon yapmak için tarih seçin
              </div>
              <button
                onClick={() => onDateChange({
                  checkIn: '',
                  checkOut: '',
                  guests: 1
                })}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
              >
                Tarih Seç
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Seçili Bilgiler */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Seçili Bilgiler</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Otel:</span>
                    <span className="font-medium">{hotel.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Property:</span>
                    <span className="font-medium">{property.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Giriş:</span>
                    <span className="font-medium">
                      {new Date(selectedDates.checkIn).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Çıkış:</span>
                    <span className="font-medium">
                      {new Date(selectedDates.checkOut).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kişi:</span>
                    <span className="font-medium">{selectedDates.guests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gece:</span>
                    <span className="font-medium">{totalNights}</span>
                  </div>
                </div>
              </div>

              {/* Rezervasyon Butonu */}
              <button
                onClick={openReservationModal}
                className="w-full px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200 text-lg"
              >
                Rezervasyon Yap
              </button>

              {/* Hızlı Bilgi */}
              <div className="text-xs text-gray-500 text-center">
                Ücretsiz iptal • Anında onay • Güvenli ödeme
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rezervasyon Onay Modal'ı */}
      {isReservationModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Rezervasyon Onayı</h3>
                <button
                  onClick={closeReservationModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  Aşağıdaki bilgilerle rezervasyon yapmak istediğinizden emin misiniz?
                </p>
                
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Otel:</span>
                    <span className="font-medium">{hotel.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Property:</span>
                    <span className="font-medium">{property?.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tarih:</span>
                    <span className="font-medium">
                      {new Date(selectedDates.checkIn).toLocaleDateString('tr-TR')} - {new Date(selectedDates.checkOut).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kişi:</span>
                    <span className="font-medium">{selectedDates.guests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Toplam:</span>
                    <span className="font-medium">{totalNights} gece</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={closeReservationModal}
                  className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
                >
                  İptal
                </button>
                <button
                  onClick={startReservation}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
                >
                  Onayla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
