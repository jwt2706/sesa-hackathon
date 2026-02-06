import { MapPin, Bed, Bath, DollarSign } from 'lucide-react';
import { Listing } from '../types/database';

interface ListingCardProps {
  listing: Listing;
  onViewClick: (listing: Listing) => void;
}

export function ListingCard({ listing, onViewClick }: ListingCardProps) {
  const mainImage = listing.image_urls[0] || 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-48 overflow-hidden">
        <img
          src={mainImage}
          alt={listing.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{listing.title}</h3>

        <div className="flex items-center gap-1 text-gray-600 mb-3">
          <MapPin size={16} />
          <span className="text-sm">{listing.address}</span>
        </div>

        <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <DollarSign size={16} />
            <span className="font-semibold">${listing.price}/mo</span>
          </div>
          <div className="flex items-center gap-1">
            <Bed size={16} />
            <span>{listing.bedrooms} bed</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath size={16} />
            <span>{listing.bathrooms} bath</span>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
            {listing.is_on_campus ? 'On Campus' : 'Off Campus'}
          </span>
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full capitalize">
            {listing.rental_type}
          </span>
        </div>

        <button
          onClick={() => onViewClick(listing)}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  );
}
