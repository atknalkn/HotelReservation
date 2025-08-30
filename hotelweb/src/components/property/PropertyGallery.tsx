'use client';

import { useState } from 'react';
import { Property } from '@/lib/types';

interface PropertyGalleryProps {
  property: Property;
}

export function PropertyGallery({ property }: PropertyGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  // Placeholder görseller (gerçek uygulamada property.images kullanılacak)
  const images = [
    {
      id: 1,
      url: '/api/placeholder/800/600',
      alt: `${property.title} - Ana görsel`,
      thumbnail: '/api/placeholder/200/150'
    },
    {
      id: 2,
      url: '/api/placeholder/800/600',
      alt: `${property.title} - Oda görseli`,
      thumbnail: '/api/placeholder/200/150'
    },
    {
      id: 3,
      url: '/api/placeholder/800/600',
      alt: `${property.title} - Banyo görseli`,
      thumbnail: '/api/placeholder/200/150'
    },
    {
      id: 4,
      url: '/api/placeholder/800/600',
      alt: `${property.title} - Dış görsel`,
      thumbnail: '/api/placeholder/200/150'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Galeri</h2>
        
        {/* Ana Görsel */}
        <div className="mb-4">
          <div className="relative h-96 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-lg overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <svg className="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-lg font-medium">{property.title}</p>
                <p className="text-sm">Ana Görsel</p>
              </div>
            </div>
            
            {/* Görsel Sayısı */}
            <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
              {selectedImage + 1} / {images.length}
            </div>
            
            {/* Navigasyon Butonları */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImage(prev => prev === 0 ? images.length - 1 : prev - 1)}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setSelectedImage(prev => prev === images.length - 1 ? 0 : prev + 1)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Küçük Görseller */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setSelectedImage(index)}
                className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  selectedImage === index 
                    ? 'border-indigo-500 ring-2 ring-indigo-200' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-xs">{index + 1}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Property Açıklaması */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{property.title}</h3>
          <p className="text-gray-600 leading-relaxed">
            {property.description || 'Bu property için henüz detaylı açıklama bulunmuyor. Yakında eklenecek.'}
          </p>
          
          {/* Property Özellikleri */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {property.city}
            </div>
            {property.averageOverallRating > 0 && (
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {property.averageOverallRating.toFixed(1)} ({property.totalReviews} yorum)
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
