import { FaMapPin, FaBed, FaBath, FaDollarSign } from 'react-icons/fa6';
import { Listing } from '../types/database';

interface ListingCardProps {
  listing: Listing;
  onViewClick: (listing: Listing) => void;
}

export function ListingCard({ listing, onViewClick }: ListingCardProps) {
  const mainImage = listing.image_urls[0] || 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg';

  return (
    <div className="glass-card rounded-lg overflow-hidden transition-transform hover:-translate-y-0.5">
      <div className="h-48 overflow-hidden">
        <img
          src={mainImage}
          alt={listing.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-100 mb-2">{listing.title}</h3>

        <div className="flex items-center gap-1 text-gray-400 mb-3">
          <FaMapPin size={16} />
          <span className="text-sm">{listing.address}</span>
        </div>

        <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <FaDollarSign size={16} />
            <span className="font-semibold">${listing.price}/mo</span>
          </div>
          <div className="flex items-center gap-1">
            <FaBed size={16} />
            <span>{listing.bedrooms} bed</span>
          </div>
          <div className="flex items-center gap-1">
            <FaBath size={16} />
            <span>{listing.bathrooms} bath</span>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <span className="px-2 py-1 text-xs rounded-full glass-pill">
            {listing.is_on_campus ? 'On Campus' : 'Off Campus'}
          </span>
          <span className="px-2 py-1 bg-white/5 text-gray-300 text-xs rounded-full border border-white/10 capitalize">
            {listing.rental_type}
          </span>
        </div>

        <button
          onClick={() => onViewClick(listing)}
          className="w-full py-2 glass-button"
        >
          View Details
        </button>
      </div>
    </div>
  );
}
