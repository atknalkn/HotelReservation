'use client';

import Link from 'next/link';
import { SearchForm } from '@/components/SearchForm';
import { useEffect, useState } from 'react';

export default function Home() {
  const [userRole, setUserRole] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setUserRole(userData.role);
      setUserName(userData.firstName && userData.lastName ? `${userData.firstName} ${userData.lastName}` : userData.email || 'Kullanıcı');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUserRole('');
    setUserName('');
    setIsDropdownOpen(false);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-indigo-600 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-white">Alkan Rezervation</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="text-white hover:text-indigo-100 px-3 py-2 rounded-md text-sm font-medium"
              >
                Ana Sayfa
              </Link>
              
              {userRole ? (
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center text-white hover:text-indigo-100 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    <span>{userName}</span>
                    <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Profilim
                      </Link>
                      <Link
                        href="/my-reservations"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Rezervasyonlarım
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Çıkış Yap
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link 
                  href="/login" 
                  className="text-white hover:text-indigo-100 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Üye Girişi
                </Link>
              )}
              
              {userRole === 'Admin' && (
                <Link 
                  href="/admin" 
                  className="text-white hover:text-indigo-100 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Admin
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:pb-28 xl:pb-32">
            <main className="mt-4 mx-auto max-w-7xl px-4 sm:mt-6 sm:px-6 md:mt-8 lg:mt-12 lg:px-8 xl:mt-16">
              <div className="text-center">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">#AlkanlaKal</span>
                </h1>
                <p className="mt-2 text-base text-gray-500 sm:mt-3 sm:text-lg sm:max-w-2xl sm:mx-auto md:mt-4 md:text-xl">
                  En iyi otelleri keşfedin, yorumları okuyun ve güvenle rezervasyon yapın. 
                  Platform komisyon sistemi ile şeffaf fiyatlandırma.
                </p>
                
                {/* Centered Search Form */}
                <div className="mt-4 sm:mt-6 flex justify-center">
                  <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Otel Ara</h2>
                      <p className="mt-2 text-gray-600">
                        Şehir, tarih ve kişi sayısına göre en uygun otelleri bulun
                      </p>
                    </div>
                    <SearchForm />
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hotel Owner Notice */}
          <div className="text-center mb-12">
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-8 border border-indigo-200">
              <h3 className="text-2xl font-bold text-indigo-900 mb-4">
                Tesisiniz Alkan Rezervation&apos;da yer almıyor mu?
              </h3>
              <p className="text-lg text-indigo-700 mb-6">
                Otelinizi platformumuza ekleyerek daha fazla müşteriye ulaşın
              </p>
              <Link href="/register/hotel-owner" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl">
                Üye Ol
              </Link>
            </div>
          </div>



          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Özellikler</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Neden Alkan Rezervation?
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Admin Onay Sistemi</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Tüm otel başvuruları ve yorumlar admin onayından geçer, kalite garantisi sağlanır.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Komisyon Yönetimi</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Esnek komisyon oranları ve hesaplama yöntemleri ile platform gelirleri optimize edilir.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Yorum Sistemi</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Detaylı puanlama ve yorum sistemi ile kullanıcı deneyimleri paylaşılır.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Güvenli API</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  JWT tabanlı kimlik doğrulama ve rol bazlı yetkilendirme ile güvenli erişim.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
