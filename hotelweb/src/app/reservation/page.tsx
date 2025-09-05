'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Link from 'next/link';
import { Hotel, Property, RoomType, Availability } from '@/lib/types';
import { ReservationForm } from '@/components/reservation/ReservationForm';
import { ReservationSummary } from '@/components/reservation/ReservationSummary';

export default function ReservationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // URL'den gelen parametreleri al
  const hotelId = searchParams.get('hotelId');
  const propertyId = searchParams.get('propertyId');
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const guests = searchParams.get('guests');

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | null>(null);
  const [reservationData, setReservationData] = useState({
    checkIn: checkIn || '',
    checkOut: checkOut || '',
    guests: parseInt(guests || '1'),
    roomTypeId: 0,
    totalPrice: 0,
    nights: 0
  });

  useEffect(() => {
    if (hotelId && propertyId && checkIn && checkOut) {
      fetchReservationDetails();
    } else {
      // Gerekli parametreler eksikse ana sayfaya yönlendir
      router.push('/');
    }
  }, [hotelId, propertyId, checkIn, checkOut]);

  const fetchReservationDetails = async () => {
    try {
      setLoading(true);
      
      // Otel bilgilerini al
      const hotelResponse = await api.get(`/api/hotels/${hotelId}`);
      setHotel(hotelResponse.data);
      
      // Property bilgilerini al
      const propertyResponse = await api.get(`/api/properties/${propertyId}`);
      setProperty(propertyResponse.data);
      
      // Oda tiplerini al
      const roomTypesResponse = await api.get(`/api/roomtypes/ByProperty/${propertyId}`);
      setRoomTypes(roomTypesResponse.data);
      
      // Availability bilgilerini al
      const availabilityResponse = await api.get('/api/availabilities');
      setAvailabilities(availabilityResponse.data);
      
      // Varsayılan oda tipini seç
      if (roomTypesResponse.data.length > 0) {
        const defaultRoomType = roomTypesResponse.data[0];
        setSelectedRoomType(defaultRoomType);
        
        // Toplam fiyat ve gece sayısını hesapla
        const nights = Math.ceil((new Date(checkOut!).getTime() - new Date(checkIn!).getTime()) / (1000 * 60 * 60 * 24));
        const availability = availabilityResponse.data.find((a: any) => a.roomTypeId === defaultRoomType.id);
        const totalPrice = availability ? availability.price * nights : 0;
        
        setReservationData(prev => ({
          ...prev,
          roomTypeId: defaultRoomType.id,
          totalPrice,
          nights
        }));
      }
    } catch (error) {
      console.error('Rezervasyon detayları alınamadı:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoomTypeChange = (roomType: RoomType) => {
    setSelectedRoomType(roomType);
    
    // Yeni oda tipi için fiyat hesapla
    const nights = Math.ceil((new Date(checkOut!).getTime() - new Date(checkIn!).getTime()) / (1000 * 60 * 60 * 24));
    const availability = availabilities.find(a => a.roomTypeId === roomType.id);
    const totalPrice = availability ? availability.price * nights : 0;
    
    setReservationData(prev => ({
      ...prev,
      roomTypeId: roomType.id,
      totalPrice,
      nights
    }));
  };

  const handleReservationSubmit = async (formData: any) => {
    try {
      // Kullanıcı bilgilerini al
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (!userData || !token) {
        alert('Rezervasyon yapmak için giriş yapmalısınız');
        router.push('/login');
        return;
      }
      
      let user;
      try {
        user = JSON.parse(userData);
      } catch (error) {
        console.error('localStorage user verisi parse edilemedi:', error);
        alert('Kullanıcı bilgileri bozuk. Lütfen tekrar giriş yapın.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
        return;
      }
      
      // Debug: Kullanıcı bilgilerini kontrol et
      console.log('Kullanıcı bilgileri:', user);
      console.log('User ID:', user.id, 'Type:', typeof user.id);
      console.log('User object keys:', Object.keys(user));
      
      // User ID kontrolü - daha kapsamlı
      if (!user || user.id === undefined || user.id === null) {
        console.error('User ID bulunamadı:', user);
        alert('Kullanıcı ID bilgisi eksik. Lütfen tekrar giriş yapın.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
        return;
      }
      
      // User ID'yi güvenli şekilde integer'a çevir
      let userId;
      if (typeof user.id === 'string') {
        userId = parseInt(user.id);
      } else if (typeof user.id === 'number') {
        userId = user.id;
      } else {
        console.error('User ID formatı beklenmeyen:', user.id);
        alert('Kullanıcı bilgisi formatı hatalı. Lütfen tekrar giriş yapın.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
        return;
      }
      
      if (isNaN(userId) || userId <= 0) {
        console.error('User ID geçersiz:', userId);
        alert('Geçersiz kullanıcı bilgisi. Lütfen tekrar giriş yapın.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
        return;
      }
      
      // Rezervasyon verilerini hazırla - sadece API'nin beklediği alanlar
      const reservationPayload = {
        userId: userId,
        hotelId: parseInt(hotelId!),
        propertyId: parseInt(propertyId!),
        roomTypeId: reservationData.roomTypeId,
        checkIn: new Date(reservationData.checkIn).toISOString(),
        checkOut: new Date(reservationData.checkOut).toISOString(),
        guests: reservationData.guests
        // totalPrice API tarafında hesaplanacak
      };

      // Debug: Gönderilen veriyi kontrol et
      console.log('Rezervasyon payload:', reservationPayload);
      
      // API'ye rezervasyon POST isteği gönder
      const response = await api.post('/api/reservations', reservationPayload);
      
      if (response.status === 201 || response.status === 200) {
        // Başarılı rezervasyon - teşekkür sayfasına yönlendir
        router.push(`/reservation/success?id=${response.data.id}`);
      }
    } catch (error: any) {
      console.error('Rezervasyon hatası:', error);
      console.error('Hata detayları:', error.response?.data);
      
      // Hata mesajını göster
      if (error.response?.data?.message) {
        alert(`Rezervasyon hatası: ${error.response.data.message}`);
      } else if (error.response?.data) {
        alert(`Rezervasyon hatası: ${JSON.stringify(error.response.data)}`);
      } else {
        alert('Rezervasyon yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">Rezervasyon bilgileri yükleniyor...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!hotel || !property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">Rezervasyon bilgileri bulunamadı</div>
              <Link href="/" className="text-indigo-600 hover:text-indigo-800 font-medium mt-4 inline-block">
                Ana sayfaya dön
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
                  <Link href={`/hotels/${hotelId}`} className="text-gray-700 hover:text-gray-900 ml-1 md:ml-2">
                    {hotel.name}
                  </Link>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span className="text-gray-500 ml-1 md:ml-2">Rezervasyon</span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Sayfa Başlığı */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Rezervasyon Tamamla</h1>
            <p className="text-lg text-gray-600">
              {hotel.name} - {property.title} için rezervasyon bilgilerinizi girin
            </p>
          </div>

          {/* Ana İçerik Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sol Taraf - Rezervasyon Formu */}
            <div className="lg:col-span-2">
              <ReservationForm 
                onSubmit={handleReservationSubmit}
                hotel={hotel}
                property={property}
                roomTypes={roomTypes}
                selectedRoomType={selectedRoomType}
                onRoomTypeChange={handleRoomTypeChange}
                reservationData={reservationData}
              />
            </div>

            {/* Sağ Taraf - Rezervasyon Özeti */}
            <div>
              <ReservationSummary 
                hotel={hotel}
                property={property}
                selectedRoomType={selectedRoomType}
                reservationData={reservationData}
                availabilities={availabilities}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
