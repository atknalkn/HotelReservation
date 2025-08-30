'use client';

import { useState } from 'react';
import { Availability } from '@/lib/types';

interface AvailabilityCalendarProps {
  availabilities: Availability[];
  selectedDates: {
    checkIn: string;
    checkOut: string;
    guests: number;
  };
  onDateChange: (dates: { checkIn: string; checkOut: string; guests: number }) => void;
}

export function AvailabilityCalendar({ availabilities, selectedDates, onDateChange }: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Minimum tarih olarak bugünü ayarla
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];

  // Gelecek 3 ay için tarih listesi oluştur
  const generateCalendarDates = () => {
    const dates = [];
    const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 3, 0);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d));
    }
    
    return dates;
  };

  const calendarDates = generateCalendarDates();

  // Tarih için availability kontrolü
  const getAvailabilityForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const dateAvailability = availabilities.find(a => a.date === dateString);
    
    if (dateAvailability) {
      return {
        available: dateAvailability.availableRooms > 0,
        price: dateAvailability.price,
        rooms: dateAvailability.availableRooms
      };
    }
    
    return { available: false, price: 0, rooms: 0 };
  };

  // Ay navigasyonu
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Tarih seçimi
  const handleDateClick = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const availability = getAvailabilityForDate(date);
    
    if (!availability.available) return;
    
    if (!selectedDates.checkIn || (selectedDates.checkIn && selectedDates.checkOut)) {
      // Yeni seçim başlat
      onDateChange({
        checkIn: dateString,
        checkOut: '',
        guests: selectedDates.guests
      });
    } else if (selectedDates.checkIn && !selectedDates.checkOut) {
      // Çıkış tarihi seç
      const checkIn = new Date(selectedDates.checkIn);
      const checkOut = new Date(dateString);
      
      if (checkOut > checkIn) {
        onDateChange({
          checkIn: selectedDates.checkIn,
          checkOut: dateString,
          guests: selectedDates.guests
        });
      }
    }
  };

  // Seçili tarih aralığındaki tüm tarihleri hesapla
  const getSelectedDateRange = () => {
    if (!selectedDates.checkIn || !selectedDates.checkOut) return [];
    
    const dates = [];
    const start = new Date(selectedDates.checkIn);
    const end = new Date(selectedDates.checkOut);
    
    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  const selectedDateRange = getSelectedDateRange();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Müsaitlik Takvimi</h3>
        
        {/* Tarih Seçimi Formu */}
        <div className="mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giriş Tarihi
            </label>
            <input
              type="date"
              value={selectedDates.checkIn}
              min={minDate}
              onChange={(e) => onDateChange({
                ...selectedDates,
                checkIn: e.target.value,
                checkOut: e.target.value >= selectedDates.checkOut ? '' : selectedDates.checkOut
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Çıkış Tarihi
            </label>
            <input
              type="date"
              value={selectedDates.checkOut}
              min={selectedDates.checkIn || minDate}
              onChange={(e) => onDateChange({
                ...selectedDates,
                checkOut: e.target.value
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kişi Sayısı
            </label>
            <select
              value={selectedDates.guests}
              onChange={(e) => onDateChange({
                ...selectedDates,
                guests: parseInt(e.target.value)
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Kişi' : 'Kişi'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Takvim Navigasyonu */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goToPreviousMonth}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h4 className="text-lg font-medium text-gray-900">
            {currentMonth.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
          </h4>
          
          <button
            onClick={goToNextMonth}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Takvim Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
          
          {calendarDates.map((date, index) => {
            const availability = getAvailabilityForDate(date);
            const isToday = date.toDateString() === today.toDateString();
            const isSelected = selectedDateRange.includes(date.toISOString().split('T')[0]);
            const isCheckIn = date.toISOString().split('T')[0] === selectedDates.checkIn;
            const isCheckOut = date.toISOString().split('T')[0] === selectedDates.checkOut;
            const isPast = date < today;
            
            return (
              <button
                key={index}
                onClick={() => handleDateClick(date)}
                disabled={isPast || !availability.available}
                className={`
                  relative p-2 text-sm rounded-md transition-all duration-200 min-h-[40px] flex flex-col items-center justify-center
                  ${isPast 
                    ? 'text-gray-300 cursor-not-allowed' 
                    : availability.available 
                      ? 'text-gray-700 hover:bg-gray-100 cursor-pointer' 
                      : 'text-gray-400 cursor-not-allowed'
                  }
                  ${isToday ? 'ring-2 ring-indigo-300' : ''}
                  ${isSelected ? 'bg-indigo-100 text-indigo-700' : ''}
                  ${isCheckIn ? 'bg-indigo-600 text-white' : ''}
                  ${isCheckOut ? 'bg-indigo-600 text-white' : ''}
                `}
              >
                <span className="font-medium">{date.getDate()}</span>
                {availability.available && (
                  <span className="text-xs text-green-600">
                    ₺{availability.price}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Seçili Tarih Bilgisi */}
        {selectedDates.checkIn && selectedDates.checkOut && (
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
            <h4 className="text-sm font-medium text-indigo-900 mb-2">Seçili Tarih Aralığı</h4>
            <div className="space-y-1 text-sm text-indigo-800">
              <div>Giriş: {new Date(selectedDates.checkIn).toLocaleDateString('tr-TR')}</div>
              <div>Çıkış: {new Date(selectedDates.checkOut).toLocaleDateString('tr-TR')}</div>
              <div>Kişi: {selectedDates.guests}</div>
              <div className="font-medium pt-2 border-t border-indigo-200">
                Toplam: {Math.ceil((new Date(selectedDates.checkOut).getTime() - new Date(selectedDates.checkIn).getTime()) / (1000 * 60 * 60 * 24))} gece
              </div>
            </div>
          </div>
        )}

        {/* Renk Açıklaması */}
        <div className="mt-4 text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-100 rounded mr-1"></div>
              <span>Müsait</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-indigo-100 rounded mr-1"></div>
              <span>Seçili</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-indigo-600 rounded mr-1"></div>
              <span>Giriş/Çıkış</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
