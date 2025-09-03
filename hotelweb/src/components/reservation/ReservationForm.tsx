'use client';

import { useState, useEffect } from 'react';
import { Hotel, Property, RoomType } from '@/lib/types';
import Link from 'next/link';

interface ReservationFormProps {
  onSubmit: (formData: any) => void;
  hotel: Hotel;
  property: Property;
  roomTypes: RoomType[];
  selectedRoomType: RoomType | null;
  onRoomTypeChange: (roomType: RoomType) => void;
  reservationData: {
    checkIn: string;
    checkOut: string;
    guests: number;
    roomTypeId: number;
    totalPrice: number;
    nights: number;
  };
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  specialRequests: string;
  termsAccepted: boolean;
}

interface FormErrors {
  [key: string]: string;
}

export function ReservationForm({ 
  onSubmit, 
  hotel, 
  property, 
  roomTypes, 
  selectedRoomType, 
  onRoomTypeChange, 
  reservationData 
}: ReservationFormProps) {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Türkiye',
    postalCode: '',
    specialRequests: '',
    termsAccepted: false
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Kullanıcı bilgilerini otomatik doldur
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phoneNumber || '',
        // Adres bilgileri genelde profilde yok, kullanıcı doldurur
        address: prev.address,
        city: prev.city,
        postalCode: prev.postalCode
      }));
    }
  }, []);

  // Form validasyonu
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Zorunlu alanları kontrol et
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Ad alanı zorunludur';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Soyad alanı zorunludur';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-posta alanı zorunludur';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefon alanı zorunludur';
    } else if (!/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = 'Geçerli bir telefon numarası girin';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Adres alanı zorunludur';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Şehir alanı zorunludur';
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Posta kodu alanı zorunludur';
    }

    if (!formData.termsAccepted) {
      newErrors.termsAccepted = 'Şartları kabul etmelisiniz';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form gönderimi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!selectedRoomType) {
      alert('Lütfen bir oda tipi seçin');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form gönderim hatası:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Form alanı değişikliği
  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Hata mesajını temizle
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Otomatik doldurulan alan sayısını hesapla
  const autoFilledFields = [formData.firstName, formData.lastName, formData.email, formData.phone].filter(field => field).length;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Kişisel Bilgiler</h2>
        
        {autoFilledFields > 0 && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-green-800">
                <span className="font-medium">{autoFilledFields} alan</span> profilinizden otomatik dolduruldu. 
                Eksik bilgileri tamamlayın.
              </p>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Oda Tipi Seçimi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Oda Tipi Seçin
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {roomTypes.map((roomType) => (
                <button
                  key={roomType.id}
                  type="button"
                  onClick={() => onRoomTypeChange(roomType)}
                  className={`p-4 border rounded-lg text-left transition-all duration-200 ${
                    selectedRoomType?.id === roomType.id
                      ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{roomType.name}</h4>
                      <p className="text-sm text-gray-600">{roomType.capacity} kişi</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-indigo-600">
                        ₺{roomType.price}
                      </div>
                      <div className="text-sm text-gray-500">gece</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Kişisel Bilgiler */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ad <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.firstName ? 'border-red-300' : 
                  formData.firstName ? 'border-green-300 bg-green-50' : 'border-gray-300'
                }`}
                placeholder="Adınız"
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Soyad <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.lastName ? 'border-red-300' : 
                  formData.lastName ? 'border-green-300 bg-green-50' : 'border-gray-300'
                }`}
                placeholder="Soyadınız"
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-posta <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.email ? 'border-red-300' : 
                  formData.email ? 'border-green-300 bg-green-50' : 'border-gray-300'
                }`}
                placeholder="ornek@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefon <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.phone ? 'border-red-300' : 
                  formData.phone ? 'border-green-300 bg-green-50' : 'border-gray-300'
                }`}
                placeholder="+90 555 123 45 67"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>
          </div>

          {/* Adres Bilgileri */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adres <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.address ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Tam adres"
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Şehir <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.city ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Şehir"
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ülke
              </label>
              <select
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Türkiye">Türkiye</option>
                <option value="Almanya">Almanya</option>
                <option value="Fransa">Fransa</option>
                <option value="İngiltere">İngiltere</option>
                <option value="İtalya">İtalya</option>
                <option value="İspanya">İspanya</option>
                <option value="Hollanda">Hollanda</option>
                <option value="Belçika">Belçika</option>
                <option value="Avusturya">Avusturya</option>
                <option value="İsviçre">İsviçre</option>
                <option value="Diğer">Diğer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Posta Kodu <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.postalCode ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="34000"
              />
              {errors.postalCode && (
                <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>
              )}
            </div>
          </div>

          {/* Özel İstekler */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Özel İstekler
            </label>
            <textarea
              value={formData.specialRequests}
              onChange={(e) => handleInputChange('specialRequests', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Özel istekleriniz varsa buraya yazabilirsiniz..."
            />
          </div>

          {/* Şartlar */}
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="termsAccepted"
              checked={formData.termsAccepted}
              onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
              className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="termsAccepted" className="text-sm text-gray-700">
              <span className="text-red-500">*</span> Rezervasyon şartlarını ve{' '}
              <Link href="/terms" className="text-indigo-600 hover:text-indigo-800 underline">
                kullanım şartlarını
              </Link>{' '}
              kabul ediyorum
            </label>
          </div>
          {errors.termsAccepted && (
            <p className="mt-1 text-sm text-red-600">{errors.termsAccepted}</p>
          )}

          {/* Gönder Butonu */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting || !selectedRoomType}
              className={`w-full px-6 py-3 text-white font-medium rounded-lg transition-colors duration-200 ${
                isSubmitting || !selectedRoomType
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
              }`}
            >
              {isSubmitting ? 'Rezervasyon Yapılıyor...' : 'Rezervasyonu Tamamla'}
            </button>
          </div>

          {/* Güvenlik Bilgisi */}
          <div className="text-center text-xs text-gray-500">
            <p>Bilgileriniz güvenli şekilde şifrelenerek saklanır</p>
            <p>SSL sertifikası ile korunmaktadır</p>
          </div>
        </form>
      </div>
    </div>
  );
}
