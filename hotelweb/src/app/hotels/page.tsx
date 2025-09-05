'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import Link from 'next/link';
import { SearchForm } from '@/components/SearchForm';
import { HotelList } from '@/components/hotels/HotelList';
import { Hotel, Review } from '@/lib/types';

function HotelsContent() {
  const searchParams = useSearchParams();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [user, setUser] = useState<any>(null);
  const [searchFilters, setSearchFilters] = useState({
    city: searchParams.get('city') || '',
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    guests: parseInt(searchParams.get('guests') || '1'),
    minPrice: parseInt(searchParams.get('minPrice') || '0'),
    maxPrice: parseInt(searchParams.get('maxPrice') || '10000'),
    minStars: parseInt(searchParams.get('minStars') || '0'),
    sortBy: searchParams.get('sortBy') || 'rating',
    sortOrder: searchParams.get('sortOrder') || 'desc'
  });

  useEffect(() => {
    fetchHotels();
    // Kullanıcı bilgilerini al
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [searchFilters]);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      
      // API parametrelerini hazırla
      const params = new URLSearchParams();
      if (searchFilters.city) params.append('city', searchFilters.city);
      if (searchFilters.checkIn) params.append('checkIn', searchFilters.checkIn);
      if (searchFilters.checkOut) params.append('checkOut', searchFilters.checkOut);
      if (searchFilters.guests > 1) params.append('guests', searchFilters.guests.toString());
      if (searchFilters.minPrice > 0) params.append('minPrice', searchFilters.minPrice.toString());
      if (searchFilters.maxPrice < 10000) params.append('maxPrice', searchFilters.maxPrice.toString());
      if (searchFilters.minStars > 0) params.append('minStars', searchFilters.minStars.toString());
      if (searchFilters.sortBy) params.append('sortBy', searchFilters.sortBy);
      if (searchFilters.sortOrder) params.append('sortOrder', searchFilters.sortOrder);
      
      const response = await api.get(`/api/hotels?${params.toString()}`);
      
      // Yeni API response formatı
      if (response.data.hotels) {
        setHotels(response.data.hotels);
      } else {
        setHotels(response.data);
      }
    } catch (error) {
      console.error('Otel listesi alınamadı:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (hotelId: number) => {
    try {
      const response = await api.get(`/api/reviews/hotel/${hotelId}`);
      setReviews(response.data);
    } catch (error) {
      console.error('Yorumlar alınamadı:', error);
    }
  };

  const handleHotelClick = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    fetchReviews(hotel.id);
  };

  const handleSearch = (filters: any) => {
    setSearchFilters(filters);
  };

  if (loading) {
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
                <button
                  onClick={() => {
                    const searchSection = document.getElementById('search-section');
                    if (searchSection) {
                      searchSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="bg-white hover:bg-gray-100 text-indigo-600 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Otel Ara
                </button>
                {user && (
                  <div className="flex items-center space-x-2">
                    <span className="text-white text-sm">
                      Hoş geldin, {user.firstName} {user.lastName}
                    </span>
                    <Link 
                      href="/profile" 
                      className="text-white hover:text-indigo-100 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Profil
                    </Link>
                  </div>
                )}
                {!user && (
                  <div className="flex items-center space-x-2">
                    <Link 
                      href="/login" 
                      className="text-white hover:text-indigo-100 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Giriş Yap
                    </Link>
                    <Link 
                      href="/register" 
                      className="bg-white hover:bg-gray-100 text-indigo-600 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                    >
                      Kayıt Ol
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>
        
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Otel Listesi</h1>
            <div className="text-center">Yükleniyor...</div>
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
              <button
                onClick={() => {
                  const searchSection = document.getElementById('search-section');
                  if (searchSection) {
                    searchSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="bg-white hover:bg-gray-100 text-indigo-600 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Otel Ara
              </button>
              {user && (
                <div className="flex items-center space-x-2">
                  <span className="text-white text-sm">
                    Hoş geldin, {user.firstName} {user.lastName}
                  </span>
                  <Link 
                    href="/profile" 
                    className="text-white hover:text-indigo-100 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Profil
                  </Link>
                  <Link 
                    href="/my-reservations" 
                    className="text-white hover:text-indigo-100 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Rezervasyonlarım
                  </Link>
                </div>
              )}
              {!user && (
                <div className="flex items-center space-x-2">
                  <Link 
                    href="/login" 
                    className="text-white hover:text-indigo-100 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Giriş Yap
                  </Link>
                  <Link 
                    href="/register" 
                    className="bg-white hover:bg-gray-100 text-indigo-600 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    Kayıt Ol
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Otel Listesi</h1>
          
          {/* Arama Formu */}
          <div id="search-section" className="mb-8">
            <SearchForm onSearch={handleSearch} />
          </div>

          {/* Otel Listesi ve Filtreler */}
          <HotelList
            hotels={hotels}
            searchFilters={searchFilters}
            onHotelClick={handleHotelClick}
          />
        </div>
      </div>

      {/* Otel Detay Modal */}
      {selectedHotel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedHotel.name}</h2>
                <button
                  onClick={() => setSelectedHotel(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center text-gray-600 mb-2">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {selectedHotel.city}, {selectedHotel.address}
                </div>
                <div className="flex items-center mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-5 h-5 ${
                        star <= selectedHotel.starRating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Yorumlar</h3>
                {reviews.length === 0 ? (
                  <p className="text-gray-500">Henüz yorum yapılmamış.</p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-l-4 border-indigo-200 pl-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= review.overallRating ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                            <span className="ml-2 text-sm text-gray-600">- {review.userEmail}</span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedHotel(null)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Kapat
                </button>
                <Link
                  href={`/hotels/${selectedHotel.id}`}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Detayları Gör
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HotelsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HotelsContent />
    </Suspense>
  );
}
