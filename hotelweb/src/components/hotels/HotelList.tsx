'use client';

import { Hotel } from '@/lib/types';
import { HotelCard } from './HotelCard';
import { HotelFilters, HotelFilters as HotelFiltersType } from './HotelFilters';
import { useState } from 'react';
import Link from 'next/link';

interface HotelListProps {
  hotels: Hotel[];
  searchFilters: {
    city: string;
    checkIn: string;
    checkOut: string;
    guests: number;
  };
  onHotelClick: (hotel: Hotel) => void;
}

export function HotelList({ hotels, searchFilters, onHotelClick }: HotelListProps) {
  const [filters, setFilters] = useState<HotelFiltersType>({
    priceRange: [0, 1000],
    rating: 0,
    capacity: 0,
    amenities: [],
    sortBy: 'rating',
    sortOrder: 'desc',
    minStars: 0
  });

  // Filtreleme ve sıralama işlemleri
  const filteredAndSortedHotels = hotels
    .filter(hotel => {
      // Minimum puan filtresi
      if (filters.rating > 0 && hotel.averageOverallRating < filters.rating) {
        return false;
      }
      
      // Kapasite filtresi (şimdilik placeholder)
      if (filters.capacity > 0) {
        // Burada gerçek kapasite kontrolü yapılacak
        // Şimdilik tüm otelleri kabul ediyoruz
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'rating':
          return b.averageOverallRating - a.averageOverallRating;
        case 'price':
          // Fiyat sıralaması (düşükten yükseğe)
          return (a.averagePrice || 0) - (b.averagePrice || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'stars':
          return filters.sortOrder === 'asc'
            ? a.starRating - b.starRating
            : b.starRating - a.starRating;
        default:
          return 0;
      }
    });

  const handleFiltersChange = (newFilters: HotelFiltersType) => {
    setFilters(newFilters);
  };

  return (
    <div className="space-y-6">
      {/* Arama Sonuçları Başlığı */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          {searchFilters.city ? `${searchFilters.city} şehrinde` : 'Tüm şehirlerde'} {filteredAndSortedHotels.length} otel bulundu
        </h2>
        {searchFilters.city && (
          <button
            onClick={() => {
              // Bu fonksiyon parent component'ten gelecek
              window.location.href = '/hotels';
            }}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            Filtreleri Temizle
          </button>
        )}
      </div>

      {/* Filtreler ve Otel Listesi */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sol Sidebar - Filtreler */}
        <div className="lg:col-span-1">
          <HotelFilters filters={filters} onFiltersChange={handleFiltersChange} />
        </div>

        {/* Sağ Taraf - Otel Listesi */}
        <div className="lg:col-span-3">
          {filteredAndSortedHotels.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">
                {searchFilters.city ? `${searchFilters.city} şehrinde otel bulunamadı.` : 'Henüz otel bulunmuyor.'}
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-400">
                  Filtrelerinizi değiştirmeyi deneyin veya
                </p>
                <Link
                  href="/"
                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  ana sayfaya dönün
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredAndSortedHotels.map((hotel) => (
                <HotelCard
                  key={hotel.id}
                  hotel={hotel}
                  onClick={onHotelClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sonuç Sayısı */}
      {filteredAndSortedHotels.length > 0 && (
        <div className="text-center py-4 text-sm text-gray-500">
          {filteredAndSortedHotels.length} otel gösteriliyor
          {filters.rating > 0 && ` (${filters.rating}+ yıldız)`}
          {filters.priceRange[0] > 0 || filters.priceRange[1] < 1000 && 
            ` (₺${filters.priceRange[0]}-₺${filters.priceRange[1]})`
          }
        </div>
      )}
    </div>
  );
}
