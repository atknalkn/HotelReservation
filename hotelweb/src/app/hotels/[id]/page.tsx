'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Link from 'next/link';
import { Hotel, Property, RoomType, Availability } from '@/lib/types';
import { PropertyGallery } from '@/components/property/PropertyGallery';
import { RoomList } from '@/components/property/RoomList';
import { AvailabilityCalendar } from '@/components/property/AvailabilityCalendar';
import { ReservationButton } from '@/components/property/ReservationButton';

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const hotelId = parseInt(params.id as string);

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedDates, setSelectedDates] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1
  });

  useEffect(() => {
    if (hotelId) {
      fetchHotelDetails();
    }
  }, [hotelId]);

  const fetchHotelDetails = async () => {
    try {
      setLoading(true);
      
      // Otel bilgilerini al
      const hotelResponse = await api.get(`/api/hotels/${hotelId}`);
      setHotel(hotelResponse.data);
      
      // Property'leri al
      const propertiesResponse = await api.get(`/api/properties?hotelId=${hotelId}`);
      setProperties(propertiesResponse.data);
      
      if (propertiesResponse.data.length > 0) {
        setSelectedProperty(propertiesResponse.data[0]);
        
        // İlk property için oda tiplerini al
        const roomTypesResponse = await api.get(`/api/roomtypes/ByProperty/${propertiesResponse.data[0].id}`);
        setRoomTypes(roomTypesResponse.data);
        
        // Availability bilgilerini al
        if (roomTypesResponse.data.length > 0) {
          const availabilityResponse = await api.get('/api/availabilities');
          setAvailabilities(availabilityResponse.data);
        }
      }
    } catch (error) {
      console.error('Otel detayları alınamadı:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePropertyChange = async (propertyId: number) => {
    const property = properties.find(p => p.id === propertyId);
    if (property) {
      setSelectedProperty(property);
      
      // Yeni property için oda tiplerini al
      try {
        const roomTypesResponse = await api.get(`/api/roomtypes/ByProperty/${propertyId}`);
        setRoomTypes(roomTypesResponse.data);
      } catch (error) {
        console.error('Oda tipleri alınamadı:', error);
      }
    }
  };

  const handleDateChange = (dates: { checkIn: string; checkOut: string; guests: number }) => {
    setSelectedDates(dates);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">Yükleniyor...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">Otel bulunamadı</div>
              <Link href="/hotels" className="text-indigo-600 hover:text-indigo-800 font-medium mt-4 inline-block">
                Otel listesine dön
              </Link>
            </div>
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
              <Link 
                href="/hotels" 
                className="text-white hover:text-indigo-100 px-3 py-2 rounded-md text-sm font-medium"
              >
                Oteller
              </Link>
              <Link 
                href="/hotels" 
                className="bg-white hover:bg-gray-100 text-indigo-600 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Otel Ara
              </Link>
              <Link 
                href="/admin" 
                className="text-white hover:text-indigo-100 px-3 py-2 rounded-md text-sm font-medium"
              >
                Admin
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link href="/" className="text-gray-700 hover:text-gray-900">
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <Link href="/hotels" className="text-gray-700 hover:text-gray-900 ml-1 md:ml-2">
                    Oteller
                  </Link>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span className="text-gray-500 ml-1 md:ml-2">{hotel.name}</span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Otel Başlığı ve Bilgileri */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{hotel.name}</h1>
                <div className="flex items-center space-x-4 text-gray-600">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {hotel.city}
                  </div>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-5 h-5 ${
                          star <= hotel.starRating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">({hotel.starRating})</span>
                  </div>
                  {hotel.averageOverallRating > 0 && (
                    <div className="flex items-center">
                      <span className="text-yellow-500 font-medium">
                        {hotel.averageOverallRating.toFixed(1)}
                      </span>
                      <span className="mx-1">•</span>
                      <span>{hotel.totalReviews} yorum</span>
                    </div>
                  )}
                </div>
                <p className="text-gray-600 mt-2">{hotel.address}</p>
              </div>
              
              {/* Property Seçici */}
              {properties.length > 1 && (
                <div className="text-right">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Seçin
                  </label>
                  <select
                    value={selectedProperty?.id || ''}
                    onChange={(e) => handlePropertyChange(parseInt(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {properties.map((property) => (
                      <option key={property.id} value={property.id}>
                        {property.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Ana İçerik Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sol Taraf - Galeri ve Oda Listesi */}
            <div className="lg:col-span-2 space-y-6">
              {/* Galeri */}
              {selectedProperty && (
                <PropertyGallery property={selectedProperty} />
              )}

              {/* Oda Listesi */}
              {roomTypes.length > 0 && (
                <RoomList 
                  roomTypes={roomTypes} 
                  availabilities={availabilities}
                  selectedDates={selectedDates}
                />
              )}
            </div>

            {/* Sağ Taraf - Rezervasyon ve Takvim */}
            <div className="space-y-6">
              {/* Rezervasyon Butonu */}
              <ReservationButton 
                hotel={hotel}
                property={selectedProperty}
                selectedDates={selectedDates}
                onDateChange={handleDateChange}
              />

              {/* Availability Takvimi */}
              {selectedProperty && (
                <AvailabilityCalendar 
                  availabilities={availabilities}
                  selectedDates={selectedDates}
                  onDateChange={handleDateChange}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
