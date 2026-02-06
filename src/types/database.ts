export interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string;
  description: string;
  profile_picture: string;
  group_id: string | null;
  is_landlord: boolean;
  created_at: string;
  updated_at: string;
}

export interface Group {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
}

export interface Listing {
  id: string;
  landlord_id: string;
  title: string;
  description: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  is_on_campus: boolean;
  gender_preference: 'any' | 'male' | 'female';
  rental_type: 'apartment' | 'house' | 'room' | 'basement' | 'floor';
  is_verified: boolean;
  image_urls: string[];
  amenities: string[];
  available_from: string;
  lease_duration: string;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  listing_id: string;
  applicant_id: string;
  group_id: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  message: string;
  created_at: string;
  updated_at: string;
}

export interface ListingFilters {
  priceMin?: number;
  priceMax?: number;
  bedrooms?: number;
  bathrooms?: number;
  isOnCampus?: boolean;
  genderPreference?: 'any' | 'male' | 'female';
  rentalType?: string[];
  amenities?: string[];
}
