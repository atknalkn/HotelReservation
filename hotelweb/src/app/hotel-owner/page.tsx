'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Hotel {
  id: number;
  name: string;
  city: string;
  address: string;
  status: string;
  starRating: number;
  createdAt: string;
}

interface RoomType {
  id: number;
  name: string;
  description: string;
  capacity: number;
  basePrice: number;
  propertyId: number;
  propertyTitle: string;
}

interface Property {
  id: number;
  title: string;
  hotelId: number;
  hotelName: string;
}

interface Availability {
  id: number;
  roomTypeId: number;
  roomTypeName: string;
  propertyTitle: string;
  hotelName: string;
  date: string;
  stock: number;
  priceOverride: number | null;
}

interface Reservation {
  id: number;
  userEmail: string;
  hotelName: string;
  propertyTitle: string;
  roomTypeName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  totalNights: number;
}

export default function HotelOwnerPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'hotels' | 'rooms' | 'availability' | 'reservations'>('hotels');
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formType, setFormType] = useState<'hotel' | 'room' | 'availability'>('hotel');
  const [formData, setFormData] = useState({
    // Hotel form data
    hotelName: '',
    hotelCity: '',
    hotelAddress: '',
    hotelTaxNo: '',
    hotelStarRating: 3,
    hotelDescription: '',
    hotelPhone: '',
    hotelEmail: '',
    hotelWebsite: '',
    hotelAmenities: [] as string[],
    hotelCheckInTime: '14:00',
    hotelCheckOutTime: '11:00',
    hotelPolicies: '',
    // Room form data
    roomName: '',
    roomDescription: '',
    roomCapacity: 2,
    roomBasePrice: 0,
    roomPropertyId: 0,
    // Availability form data
    availabilityRoomTypeId: 0,
    availabilityStartDate: '',
    availabilityEndDate: '',
    availabilityStock: 1,
    availabilityPriceOverride: ''
  });

  // Amenities categories and options
  const amenitiesCategories = {
    'Genel Özellikler': [
      'Ücretsiz Wi-Fi',
      '24 Saat Resepsiyon',
      'Oda Servisi',
      'Asansör',
      'Engelli Dostu Olanaklar'
    ],
    'Yeme & İçme': [
      'Restoran',
      'Kahvaltı Dahil',
      'Kahve & Çay Servisi',
      'Lobi Bar'
    ],
    'Sağlık & Spa': [
      'Sauna',
      'Türk Hamamı',
      'Spa & Masaj',
      'Fitness Salonu',
      'Kapalı Yüzme Havuzu'
    ],
    'Ulaşım & Park': [
      'Ücretsiz Otopark',
      'Vale Hizmeti',
      'Havaalanı Servisi (Ücretli)',
      'Araç Kiralama'
    ],
    'Aile & Çocuk': [
      'Çocuk Oyun Alanı',
      'Bebek Yatağı',
      'Çocuk Bakım Hizmeti'
    ],
    'İş & Toplantı': [
      'Toplantı Salonu',
      'İş Merkezi',
      'Projeksiyon & Ses Sistemi'
    ]
  };

  const [expandedAmenityCategories, setExpandedAmenityCategories] = useState<string[]>([]);

  const toggleAmenityCategory = (category: string) => {
    setExpandedAmenityCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      hotelAmenities: prev.hotelAmenities.includes(amenity)
        ? prev.hotelAmenities.filter(a => a !== amenity)
        : [...prev.hotelAmenities, amenity]
    }));
  };
  const router = useRouter();

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(user);
    if (userData.role !== 'HotelOwner') {
      router.push('/');
      return;
    }

    await fetchData();
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [hotelsRes, propertiesRes, roomTypesRes, availabilitiesRes] = await Promise.all([
        api.get('/api/hotels/my-hotels', { headers }),
        api.get('/api/properties/my-properties', { headers }),
        api.get('/api/roomtypes/my-room-types', { headers }),
        api.get('/api/availabilities/my-availabilities', { headers })
      ]);

      setHotels(hotelsRes.data);
      setProperties(propertiesRes.data);
      setRoomTypes(roomTypesRes.data);
      setAvailabilities(availabilitiesRes.data);

      // İlk oteli seç ve rezervasyonları getir
      if (hotelsRes.data.length > 0) {
        setSelectedHotel(hotelsRes.data[0]);
        await fetchReservations(hotelsRes.data[0].id, headers);
      }
    } catch (error) {
      console.error('Veri alınamadı:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReservations = async (hotelId: number, headers: any) => {
    try {
      const reservationsRes = await api.get(`/api/reservations/hotel/${hotelId}`, { headers });
      setReservations(reservationsRes.data);
    } catch (error) {
      console.error('Rezervasyonlar alınamadı:', error);
    }
  };

  const handleHotelChange = async (hotelId: number) => {
    const hotel = hotels.find(h => h.id === hotelId);
    setSelectedHotel(hotel || null);
    
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    await fetchReservations(hotelId, headers);
  };

  const handleAddNew = (type: 'hotel' | 'room' | 'availability') => {
    setFormType(type);
    setShowAddForm(true);
  };

  const createPropertiesForExistingHotels = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const response = await api.post('/api/hotels/create-properties-for-existing-hotels', {}, { headers });
      console.log('Properties created:', response.data);
      alert('Property\'ler oluşturuldu!');
      
      // Verileri yeniden çek
      await fetchData();
    } catch (error) {
      console.error('Property oluşturma hatası:', error);
      alert('Property oluşturulurken hata oluştu');
    }
  };

  const handleFormSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Giriş yapmanız gerekiyor');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      console.log('Form data being sent:', formData);
      console.log('Form type:', formType);

      switch (formType) {
        case 'hotel':
          console.log('Sending hotel data to backend...');
          
          // JWT token'dan user ID'yi çıkar
          const tokenPayload = JSON.parse(atob(token.split('.')[1]));
          const currentUserId = tokenPayload.UserId;
          
          const hotelData = {
            ownerUserId: currentUserId,
            name: formData.hotelName,
            city: formData.hotelCity,
            address: formData.hotelAddress,
            taxNo: formData.hotelTaxNo,
            starRating: formData.hotelStarRating,
            description: formData.hotelDescription,
            phone: formData.hotelPhone,
            email: formData.hotelEmail,
            website: formData.hotelWebsite,
            amenities: formData.hotelAmenities.join(', '),
            checkInTime: formData.hotelCheckInTime,
            checkOutTime: formData.hotelCheckOutTime,
            policies: formData.hotelPolicies
          };
          console.log('Hotel data to send:', hotelData);
          
          const hotelResponse = await api.post('/api/hotels', hotelData, { headers });
          console.log('Hotel creation response:', hotelResponse.data);
          alert('Otel başarıyla eklendi!');
          break;
        case 'room':
          if (!formData.roomPropertyId) {
            alert('Lütfen bir otel seçin!');
            return;
          }
          
          // Eğer property yoksa otomatik oluştur
          if (properties.length === 0) {
            try {
              await createPropertiesForExistingHotels();
            } catch (error) {
              alert('Property oluşturulurken hata oluştu. Lütfen tekrar deneyin.');
              return;
            }
          }
          
          console.log('Sending room data to backend...');
          const roomResponse = await api.post('/api/roomtypes', {
            propertyId: formData.roomPropertyId,
            name: formData.roomName,
            description: formData.roomDescription,
            capacity: formData.roomCapacity,
            basePrice: formData.roomBasePrice
          }, { headers });
          console.log('Room creation response:', roomResponse.data);
          alert('Oda tipi başarıyla eklendi!');
          break;
        case 'availability':
          if (!formData.availabilityRoomTypeId) {
            alert('Lütfen bir oda tipi seçin!');
            return;
          }
          if (!formData.availabilityStartDate || !formData.availabilityEndDate) {
            alert('Lütfen başlangıç ve bitiş tarihlerini seçin!');
            return;
          }
          if (new Date(formData.availabilityStartDate) > new Date(formData.availabilityEndDate)) {
            alert('Başlangıç tarihi bitiş tarihinden sonra olamaz!');
            return;
          }
          
          console.log('Sending availability data to backend...');
          const availabilityResponse = await api.post('/api/availabilities', {
            roomTypeId: formData.availabilityRoomTypeId,
            startDate: formData.availabilityStartDate,
            endDate: formData.availabilityEndDate,
            stock: formData.availabilityStock,
            priceOverride: formData.availabilityPriceOverride || null
          }, { headers });
          console.log('Availability creation response:', availabilityResponse.data);
          alert('Müsaitlik başarıyla eklendi!');
          break;
      }

      // Reset form
      setFormData({
        hotelName: '',
        hotelCity: '',
        hotelAddress: '',
        hotelTaxNo: '',
        hotelStarRating: 3,
        hotelDescription: '',
        hotelPhone: '',
        hotelEmail: '',
        hotelWebsite: '',
        hotelAmenities: [],
        hotelCheckInTime: '14:00',
        hotelCheckOutTime: '11:00',
        hotelPolicies: '',
        roomName: '',
        roomDescription: '',
        roomCapacity: 2,
        roomBasePrice: 0,
        roomPropertyId: 0,
        availabilityRoomTypeId: 0,
        availabilityStartDate: '',
        availabilityEndDate: '',
        availabilityStock: 1,
        availabilityPriceOverride: ''
      });
      setFormType(null);
      setShowAddForm(false);
    } catch (error: any) {
      console.error('Form submission error:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        alert(`Hata: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        console.error('Request error:', error.request);
        alert('Sunucuya bağlanılamadı. Lütfen tekrar deneyin.');
      } else {
        console.error('Other error:', error);
        alert(`Beklenmeyen hata: ${error.message}`);
      }
    }
  };

  const handleDelete = async (type: string, id: number) => {
    if (!confirm('Bu öğeyi silmek istediğinizden emin misiniz?')) return;

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      switch (type) {
        case 'hotel':
          await api.delete(`/api/hotels/${id}`, { headers });
          break;
        case 'room':
          await api.delete(`/api/roomtypes/${id}`, { headers });
          break;
        case 'availability':
          await api.delete(`/api/availabilities/${id}`, { headers });
          break;
      }

      await fetchData();
    } catch (error) {
      console.error('Silme hatası:', error);
      alert('Silme işlemi başarısız oldu');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Otel Sahibi Paneli</h1>
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
              <span className="text-xl font-bold text-white">Alkan Rezervation</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/hotel-owner" 
                className="text-indigo-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Otel Sahibi Paneli
              </Link>
              <Link 
                href="/profile" 
                className="text-white hover:text-indigo-100 px-3 py-2 rounded-md text-sm font-medium"
              >
                Profilim
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  window.location.href = '/login';
                }}
                className="text-white hover:text-indigo-100 px-3 py-2 rounded-md text-sm font-medium"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Otel Sahibi Paneli</h1>
          
          {/* Hotel Selection */}
          {hotels.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Otel Seçin
              </label>
              <select
                value={selectedHotel?.id || ''}
                onChange={(e) => handleHotelChange(Number(e.target.value))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                {hotels.map((hotel) => (
                  <option key={hotel.id} value={hotel.id}>
                    {hotel.name} - {hotel.city} ({hotel.status})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('hotels')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'hotels'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-900 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Otellerim ({hotels.length})
              </button>
              <button
                onClick={() => setActiveTab('rooms')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'rooms'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-900 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Oda Tiplerim ({roomTypes.length})
              </button>
              <button
                onClick={() => setActiveTab('availability')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'availability'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-900 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Müsaitlik ({availabilities.length})
              </button>
              <button
                onClick={() => setActiveTab('reservations')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'reservations'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-900 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Rezervasyonlar ({reservations.length})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'hotels' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Otellerim</h2>
                <button
                  onClick={() => handleAddNew('hotel')}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Yeni Otel Ekle
                </button>
              </div>
              {hotels.length > 0 ? (
                <div className="space-y-4">
                  {hotels.map((hotel) => (
                    <div key={hotel.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">{hotel.name}</h3>
                          <p className="text-gray-600">{hotel.city}</p>
                          <p className="text-sm text-gray-500">{hotel.address}</p>
                          <p className="text-xs text-gray-400">
                            Yıldız: {hotel.starRating} | Durum: {hotel.status} | 
                            Oluşturulma: {new Date(hotel.createdAt).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleDelete('hotel', hotel.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                          >
                            Sil
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Henüz otel eklenmemiş.
                </p>
              )}
            </div>
          )}

          {activeTab === 'rooms' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Oda Tiplerim</h2>
                <button
                  onClick={() => handleAddNew('room')}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Yeni Oda Tipi Ekle
                </button>
              </div>
              {roomTypes.length > 0 ? (
                <div className="space-y-4">
                  {roomTypes.map((roomType) => (
                    <div key={roomType.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">{roomType.name}</h3>
                          <p className="text-gray-600">{roomType.description}</p>
                          <p className="text-sm text-gray-500">
                            Kapasite: {roomType.capacity} kişi | Fiyat: {roomType.basePrice} TL
                          </p>
                          <p className="text-xs text-gray-400">
                            Tesis: {roomType.propertyTitle}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleDelete('room', roomType.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                          >
                            Sil
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Henüz oda tipi eklenmemiş.
                </p>
              )}
            </div>
          )}

          {activeTab === 'availability' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Müsaitlik Yönetimi</h2>
                <button
                  onClick={() => handleAddNew('availability')}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Yeni Müsaitlik Ekle
                </button>
              </div>
              {availabilities.length > 0 ? (
                <div className="space-y-4">
                  {availabilities.map((availability) => (
                    <div key={availability.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">{availability.roomTypeName}</h3>
                          <p className="text-gray-600">{availability.propertyTitle}</p>
                          <p className="text-sm text-gray-500">
                            Tarih: {new Date(availability.date).toLocaleDateString('tr-TR')} | 
                            Günlük Stok: {availability.stock} oda
                          </p>
                          <p className="text-xs text-gray-400">
                            Otel: {availability.hotelName} | 
                            Fiyat: {availability.priceOverride || 'Varsayılan'}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleDelete('availability', availability.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                          >
                            Sil
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Henüz müsaitlik kaydı eklenmemiş.
                </p>
              )}
            </div>
          )}

          {activeTab === 'reservations' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Rezervasyon Takibi</h2>
              {reservations.length > 0 ? (
                <div className="space-y-4">
                  {reservations.map((reservation) => (
                    <div key={reservation.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {reservation.hotelName} - {reservation.propertyTitle}
                          </h3>
                          <p className="text-gray-600">{reservation.roomTypeName}</p>
                          <p className="text-sm text-gray-500">
                            Misafir: {reservation.userEmail} | Kişi: {reservation.guests}
                          </p>
                          <p className="text-xs text-gray-400">
                            Giriş: {new Date(reservation.checkIn).toLocaleDateString('tr-TR')} | 
                            Çıkış: {new Date(reservation.checkOut).toLocaleDateString('tr-TR')} | 
                            {reservation.totalNights} gece
                          </p>
                          <p className="text-xs text-gray-400">
                            Toplam: {reservation.totalPrice} TL | Durum: {reservation.status} | 
                            {new Date(reservation.createdAt).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            reservation.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                            reservation.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            reservation.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {reservation.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Henüz rezervasyon bulunmuyor.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-black">
                {formType === 'hotel' ? 'Yeni Otel Ekle' :
                 formType === 'room' ? 'Yeni Oda Tipi Ekle' :
                 'Yeni Müsaitlik Ekle'}
              </h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {formType === 'hotel' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Otel Adı *</label>
                    <input
                      type="text"
                      value={formData.hotelName}
                      onChange={(e) => setFormData({...formData, hotelName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Şehir *</label>
                    <input
                      type="text"
                      value={formData.hotelCity}
                      onChange={(e) => setFormData({...formData, hotelCity: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adres *</label>
                    <textarea
                      value={formData.hotelAddress}
                      onChange={(e) => setFormData({...formData, hotelAddress: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      rows={2}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vergi Numarası *</label>
                    <input
                      type="text"
                      value={formData.hotelTaxNo}
                      onChange={(e) => setFormData({...formData, hotelTaxNo: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      placeholder="1234567890"
                      maxLength={10}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Yıldız Sayısı *</label>
                    <select
                      value={formData.hotelStarRating}
                      onChange={(e) => setFormData({...formData, hotelStarRating: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    >
                      {[1, 2, 3, 4, 5].map(star => (
                        <option key={star} value={star}>{star} Yıldız</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Otel Açıklaması</label>
                    <textarea
                      value={formData.hotelDescription}
                      onChange={(e) => setFormData({...formData, hotelDescription: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      rows={3}
                      placeholder="Otel hakkında detaylı bilgi..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefon Numarası</label>
                    <input
                      type="tel"
                      value={formData.hotelPhone}
                      onChange={(e) => setFormData({...formData, hotelPhone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      placeholder="+90 555 123 45 67"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Adresi</label>
                    <input
                      type="email"
                      value={formData.hotelEmail}
                      onChange={(e) => setFormData({...formData, hotelEmail: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      placeholder="info@oteladi.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    <input
                      type="url"
                      value={formData.hotelWebsite}
                      onChange={(e) => setFormData({...formData, hotelWebsite: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      placeholder="https://www.oteladi.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Otel Özellikleri</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {Object.entries(amenitiesCategories).map(([category, amenities]) => (
                        <div key={category} className="flex flex-col">
                          <button
                            onClick={() => toggleAmenityCategory(category)}
                            className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer ${
                              expandedAmenityCategories.includes(category)
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                          >
                            {category}
                          </button>
                          {expandedAmenityCategories.includes(category) && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {amenities.map(amenity => (
                                <button
                                  key={amenity}
                                  onClick={() => toggleAmenity(amenity)}
                                  className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer ${
                                    formData.hotelAmenities.includes(amenity)
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                  }`}
                                >
                                  {amenity}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    {formData.hotelAmenities.length > 0 && (
                      <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                        <p className="text-xs text-blue-800 font-medium mb-1">Seçilen Özellikler:</p>
                        <div className="flex flex-wrap gap-1">
                          {formData.hotelAmenities.map(amenity => (
                            <span key={amenity} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Saati</label>
                      <input
                        type="time"
                        value={formData.hotelCheckInTime}
                        onChange={(e) => setFormData({...formData, hotelCheckInTime: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Saati</label>
                      <input
                        type="time"
                        value={formData.hotelCheckOutTime}
                        onChange={(e) => setFormData({...formData, hotelCheckOutTime: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Otel Kuralları</label>
                    <textarea
                      value={formData.hotelPolicies}
                      onChange={(e) => setFormData({...formData, hotelPolicies: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      rows={2}
                      placeholder="Otel kuralları ve politikaları..."
                    />
                  </div>
                  
                </>
              )}

              {formType === 'room' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Otel Seçin *</label>
                    <select
                      value={formData.roomPropertyId}
                      onChange={(e) => setFormData({...formData, roomPropertyId: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      required
                    >
                      <option value={0}>Otel seçin...</option>
                      {properties.map((property) => (
                        <option key={property.id} value={property.id}>
                          {property.title} - {property.hotelName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Oda Tipi Adı</label>
                    <input
                      type="text"
                      value={formData.roomName}
                      onChange={(e) => setFormData({...formData, roomName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                    <textarea
                      value={formData.roomDescription}
                      onChange={(e) => setFormData({...formData, roomDescription: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      rows={3}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kapasite</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.roomCapacity}
                      onChange={(e) => setFormData({...formData, roomCapacity: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Temel Fiyat (TL)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.roomBasePrice}
                      onChange={(e) => setFormData({...formData, roomBasePrice: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      required
                    />
                  </div>
                </>
              )}

              {formType === 'availability' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Oda Tipi Seçin *</label>
                    <select
                      value={formData.availabilityRoomTypeId}
                      onChange={(e) => setFormData({...formData, availabilityRoomTypeId: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      required
                    >
                      <option value={0}>Oda tipi seçin...</option>
                      {roomTypes.map((roomType) => (
                        <option key={roomType.id} value={roomType.id}>
                          {roomType.name} - {roomType.propertyTitle}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Başlangıç Tarihi *</label>
                      <input
                        type="date"
                        value={formData.availabilityStartDate}
                        onChange={(e) => setFormData({...formData, availabilityStartDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">Bitiş Tarihi *</label>
                      <input
                        type="date"
                        value={formData.availabilityEndDate}
                        onChange={(e) => setFormData({...formData, availabilityEndDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Günlük Stok Sayısı *</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.availabilityStock}
                      onChange={(e) => setFormData({...formData, availabilityStock: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      placeholder="Her gün için kaç oda müsait"
                      required
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Bu sayı seçilen tarih aralığındaki her gün için geçerli olacak
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Özel Fiyat (TL) - Opsiyonel</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.availabilityPriceOverride}
                      onChange={(e) => setFormData({...formData, availabilityPriceOverride: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      placeholder="Boş bırakırsanız varsayılan fiyat kullanılır"
                    />
                  </div>
                </>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Ekle
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
