'use client';

import { useState } from 'react';

export interface HotelFilters {
  priceRange: [number, number];
  rating: number;
  capacity: number;
  amenities: string[];
  sortBy: 'price' | 'rating' | 'name' | 'stars';
  sortOrder: 'asc' | 'desc';
  minStars: number;
}

interface HotelFiltersProps {
  filters: HotelFilters;
  onFiltersChange: (filters: HotelFilters) => void;
}

export function HotelFilters({ filters, onFiltersChange }: HotelFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof HotelFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const amenities = [
    { id: 'wifi', label: 'WiFi', icon: '📶' },
    { id: 'parking', label: 'Ücretsiz Otopark', icon: '🚗' },
    { id: 'breakfast', label: 'Kahvaltı Dahil', icon: '🍳' },
    { id: 'pool', label: 'Havuz', icon: '🏊' },
    { id: 'gym', label: 'Spor Salonu', icon: '💪' },
    { id: 'spa', label: 'Spa', icon: '💆' },
    { id: 'restaurant', label: 'Restoran', icon: '🍽️' },
    { id: 'bar', label: 'Bar', icon: '🍷' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filtreler</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
        >
          {isExpanded ? 'Gizle' : 'Göster'}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-6">
          {/* Fiyat Aralığı */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Fiyat Aralığı</h4>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                placeholder="Min"
                value={filters.priceRange[0]}
                onChange={(e) => handleFilterChange('priceRange', [parseInt(e.target.value) || 0, filters.priceRange[1]])}
                className="w-20 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.priceRange[1]}
                onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], parseInt(e.target.value) || 1000])}
                className="w-20 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-gray-500 text-sm">₺</span>
            </div>
          </div>

          {/* Minimum Puan */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Minimum Puan</h4>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleFilterChange('rating', star)}
                  className={`p-2 rounded-md transition-colors ${
                    filters.rating >= star
                      ? 'bg-yellow-100 text-yellow-600'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600">
                {filters.rating}+ yıldız
              </span>
            </div>
          </div>

          {/* Kapasite */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Kapasite</h4>
            <select
              value={filters.capacity}
              onChange={(e) => handleFilterChange('capacity', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={0}>Tümü</option>
              <option value={1}>1 kişi</option>
              <option value={2}>2 kişi</option>
              <option value={3}>3 kişi</option>
              <option value={4}>4 kişi</option>
              <option value={5}>5+ kişi</option>
            </select>
          </div>

          {/* Yıldız Filtresi */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Minimum Yıldız</h4>
            <select
              value={filters.minStars}
              onChange={(e) => handleFilterChange('minStars', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={0}>Tümü</option>
              <option value={1}>1+ Yıldız</option>
              <option value={2}>2+ Yıldız</option>
              <option value={3}>3+ Yıldız</option>
              <option value={4}>4+ Yıldız</option>
              <option value={5}>5 Yıldız</option>
            </select>
          </div>

          {/* Sıralama */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Sıralama</h4>
            <div className="space-y-2">
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value as HotelFilters['sortBy'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="rating">Puana Göre</option>
                <option value="price">Fiyata Göre</option>
                <option value="name">İsme Göre</option>
                <option value="stars">Yıldıza Göre</option>
              </select>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value as HotelFilters['sortOrder'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="desc">Yüksekten Düşüğe</option>
                <option value="asc">Düşükten Yükseğe</option>
              </select>
            </div>
          </div>

          {/* Özellikler */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Özellikler</h4>
            <div className="grid grid-cols-2 gap-2">
              {amenities.map((amenity) => (
                <label key={amenity.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.amenities.includes(amenity.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleFilterChange('amenities', [...filters.amenities, amenity.id]);
                      } else {
                        handleFilterChange('amenities', filters.amenities.filter(id => id !== amenity.id));
                      }
                    }}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">
                    {amenity.icon} {amenity.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Filtreleri Temizle */}
          <div className="pt-4 border-t">
            <button
              onClick={() => onFiltersChange({
                priceRange: [0, 1000],
                rating: 0,
                capacity: 0,
                amenities: [],
                sortBy: 'rating',
                sortOrder: 'desc',
                minStars: 0
              })}
              className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
            >
              Filtreleri Temizle
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
