'use client';

import { Hotel } from '@/lib/types';

interface HotelCardProps {
  hotel: Hotel;
  onClick: (hotel: Hotel) => void;
}

export function HotelCard({ hotel, onClick }: HotelCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-.1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:-translate-y-1"
      onClick={() => onClick(hotel)}
    >
      {/* Otel Resmi Placeholder */}
      <div className="h-48 bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p className="text-sm">Otel Görseli</p>
        </div>
      </div>

      <div className="p-6">
        {/* Otel Adı ve Yıldız */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1 mr-3">
            {hotel.name}
          </h3>
          <div className="flex-shrink-0">
            {renderStars(hotel.starRating)}
          </div>
        </div>
        
        {/* Konum Bilgisi */}
        <div className="mb-3">
          <div className="flex items-center text-gray-600 text-sm mb-1">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {hotel.city}
          </div>
          <div className="text-gray-600 text-sm line-clamp-2">
            {hotel.address}
          </div>
        </div>

        {/* Puan ve Yorum Bilgisi */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-sm text-gray-500">
            {hotel.averageOverallRating > 0 ? (
              <>
                <span className="text-yellow-500 font-medium">
                  {hotel.averageOverallRating.toFixed(1)}
                </span>
                <span className="mx-1">•</span>
                <span>{hotel.totalReviews} yorum</span>
              </>
            ) : (
              <span>Henüz yorum yok</span>
            )}
          </div>
          
          <div className="text-sm text-gray-500">
            {formatDate(hotel.createdAt)}
          </div>
        </div>

        {/* Fiyat Bilgisi (Placeholder) */}
        <div className="border-t pt-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              <span className="text-lg font-semibold text-indigo-600">
                ₺{Math.floor(Math.random() * 500) + 200}
              </span>
              <span className="text-gray-400"> / gece</span>
            </div>
            <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors duration-200">
              Detayları Gör
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
