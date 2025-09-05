'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SearchFormProps {
  onSearch?: (filters: { city: string; checkIn: string; checkOut: string; guests: number }) => void;
}

export function SearchForm({ onSearch }: SearchFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    city: '',
    checkIn: '',
    checkOut: '',
    guests: 1
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Eğer onSearch prop'u varsa, önce onu çağır
    if (onSearch) {
      onSearch(formData);
    }
    
    // Form verilerini URL parametreleri olarak hotels sayfasına gönder
    const searchParams = new URLSearchParams();
    if (formData.city) searchParams.set('city', formData.city);
    if (formData.checkIn) searchParams.set('checkIn', formData.checkIn);
    if (formData.checkOut) searchParams.set('checkOut', formData.checkOut);
    if (formData.guests > 1) searchParams.set('guests', formData.guests.toString());
    
    const queryString = searchParams.toString();
    const url = queryString ? `/hotels?${queryString}` : '/hotels';
    
    router.push(url);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'guests' ? parseInt(value) : value
    }));
  };

  // Minimum tarih olarak bugünü ayarla
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Şehir */}
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
            Şehir
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            placeholder="Şehir adı girin"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
          />
        </div>

        {/* Giriş Tarihi */}
        <div>
          <label htmlFor="checkIn" className="block text-sm font-medium text-gray-700 mb-2">
            Giriş Tarihi
          </label>
          <input
            type="date"
            id="checkIn"
            name="checkIn"
            value={formData.checkIn}
            onChange={handleInputChange}
            min={today}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
          />
        </div>

        {/* Çıkış Tarihi */}
        <div>
          <label htmlFor="checkOut" className="block text-sm font-medium text-gray-700 mb-2">
            Çıkış Tarihi
          </label>
          <input
            type="date"
            id="checkOut"
            name="checkOut"
            value={formData.checkOut}
            onChange={handleInputChange}
            min={formData.checkIn || tomorrow}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
          />
        </div>

        {/* Kişi Sayısı */}
        <div>
          <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-2">
            Kişi Sayısı
          </label>
          <select
            id="guests"
            name="guests"
            value={formData.guests}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
              <option key={num} value={num}>
                {num} {num === 1 ? 'Kişi' : 'Kişi'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Arama Butonu */}
      <div className="mt-6 text-center">
        <button
          type="submit"
          className="w-full md:w-auto px-8 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
        >
          <svg className="inline-block w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Otel Ara
        </button>
      </div>
    </form>
  );
}
