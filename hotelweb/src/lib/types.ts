export interface Hotel {
  id: number;
  name: string;
  city: string;
  address: string;
  status: string;
  averageOverallRating: number;
  totalReviews: number;
  createdAt: string;
  starRating: number;
  ownerUserId: number;
  taxNo: string;
}

export interface Review {
  id: number;
  overallRating: number;
  comment: string;
  createdAt: string;
  userEmail: string;
}

export interface Property {
  id: number;
  title: string;
  description: string;
  hotelId: number;
  city: string;
  address: string;
  averageOverallRating: number;
  totalReviews: number;
  stars: number;
  hotelName?: string;
}

export interface RoomType {
  id: number;
  name: string;
  description: string;
  capacity: number;
  price: number;
  basePrice: number;
  propertyId: number;
  propertyTitle?: string;
}

export interface Availability {
  id: number;
  roomTypeId: number;
  date: string;
  availableRooms: number;
  price: number;
  stock: number;
  priceOverride: number | null;
  roomTypeName?: string;
  propertyTitle?: string;
  hotelName?: string;
}

export interface Reservation {
  id: number;
  userId: number;
  hotelId: number;
  propertyId: number;
  roomTypeId: number;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  totalNights: number;
}

export interface ReservationResponse {
  id: number;
  userId: number;
  userEmail: string;
  hotelId: number;
  hotelName: string;
  propertyId: number;
  propertyTitle: string;
  roomTypeId: number;
  roomTypeName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  totalNights: number;
}

export interface User {
  id: number;
  email: string;
  role: string;
  createdAt: string;
}

// Hotel Owner specific interfaces
export interface HotelDashboard {
  hotel: Hotel;
  statistics: {
    totalProperties: number;
    totalRoomTypes: number;
    totalReservations: number;
    activeReservations: number;
  };
}

export interface HotelFormData {
  name: string;
  city: string;
  address: string;
  taxNo: string;
  starRating: number;
}

export interface PropertyFormData {
  hotelId: number;
  title: string;
  description: string;
  city: string;
  address: string;
  stars: number;
  location: string;
}

export interface RoomTypeFormData {
  propertyId: number;
  name: string;
  description: string;
  capacity: number;
  basePrice: number;
}

export interface AvailabilityFormData {
  roomTypeId: number;
  date: string;
  stock: number;
  priceOverride: number | null;
}
