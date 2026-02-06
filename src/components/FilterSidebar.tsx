import { useState } from 'react';
import { ListingFilters } from '../types/database';

interface FilterSidebarProps {
  onFilterChange: (filters: ListingFilters) => void;
}

export function FilterSidebar({ onFilterChange }: FilterSidebarProps) {
  const [filters, setFilters] = useState<ListingFilters>({});

  const handleFilterChange = (key: keyof ListingFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleRentalTypeToggle = (type: string) => {
    const currentTypes = filters.rentalType || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter((t) => t !== type)
      : [...currentTypes, type];
    handleFilterChange('rentalType', newTypes);
  };

  const handleAmenityToggle = (amenity: string) => {
    const currentAmenities = filters.amenities || [];
    const newAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter((a) => a !== amenity)
      : [...currentAmenities, amenity];
    handleFilterChange('amenities', newAmenities);
  };

  return (
    <div className="glass-card rounded-lg p-6 h-fit">
      <h3 className="text-lg font-semibold text-gray-100 mb-4">Filters</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Price Range
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.priceMin || ''}
              onChange={(e) =>
                handleFilterChange('priceMin', e.target.value ? Number(e.target.value) : undefined)
              }
              className="glass-input text-sm px-3 py-2"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.priceMax || ''}
              onChange={(e) =>
                handleFilterChange('priceMax', e.target.value ? Number(e.target.value) : undefined)
              }
              className="glass-input text-sm px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Bedrooms
          </label>
          <select
            value={filters.bedrooms || ''}
            onChange={(e) =>
              handleFilterChange('bedrooms', e.target.value ? Number(e.target.value) : undefined)
            }
            className="glass-input text-sm px-3 py-2"
          >
            <option value="">Any</option>
            {[1, 2, 3, 4, 5].map((num) => (
              <option key={num} value={num}>
                {num}+
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Bathrooms
          </label>
          <select
            value={filters.bathrooms || ''}
            onChange={(e) =>
              handleFilterChange('bathrooms', e.target.value ? Number(e.target.value) : undefined)
            }
            className="glass-input text-sm px-3 py-2"
          >
            <option value="">Any</option>
            {[1, 1.5, 2, 2.5, 3].map((num) => (
              <option key={num} value={num}>
                {num}+
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Location
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="location"
                checked={filters.isOnCampus === undefined}
                onChange={() => handleFilterChange('isOnCampus', undefined)}
                className="mr-2 accent-blue-600"
              />
              <span className="text-sm text-gray-300">All</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="location"
                checked={filters.isOnCampus === true}
                onChange={() => handleFilterChange('isOnCampus', true)}
                className="mr-2 accent-blue-600"
              />
              <span className="text-sm text-gray-300">On Campus</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="location"
                checked={filters.isOnCampus === false}
                onChange={() => handleFilterChange('isOnCampus', false)}
                className="mr-2 accent-blue-600"
              />
              <span className="text-sm text-gray-300">Off Campus</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Gender Preference
          </label>
          <select
            value={filters.genderPreference || 'any'}
            onChange={(e) => handleFilterChange('genderPreference', e.target.value as any)}
            className="glass-input text-sm px-3 py-2"
          >
            <option value="any">Any</option>
            <option value="male">Male Only</option>
            <option value="female">Female Only</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Rental Type
          </label>
          <div className="space-y-2">
            {['apartment', 'house', 'room', 'basement', 'floor'].map((type) => (
              <label key={type} className="flex items-center">
                <input
                  type="checkbox"
                  checked={(filters.rentalType || []).includes(type)}
                  onChange={() => handleRentalTypeToggle(type)}
                  className="mr-2 accent-blue-600"
                />
                <span className="text-sm text-gray-300 capitalize">{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Amenities
          </label>
          <div className="space-y-2">
            {['Parking', 'Laundry', 'Wi-Fi', 'Gym', 'Pool', 'Furnished', 'Pet Friendly'].map(
              (amenity) => (
                <label key={amenity} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={(filters.amenities || []).includes(amenity)}
                    onChange={() => handleAmenityToggle(amenity)}
                    className="mr-2 accent-blue-600"
                  />
                  <span className="text-sm text-gray-300">{amenity}</span>
                </label>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
