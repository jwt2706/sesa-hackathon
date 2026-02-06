import { useState } from 'react';
import { FaXmark } from 'react-icons/fa6';
import { listingService } from '../services/api';
import { Listing } from '../types/database';

interface UploadListingModalProps {
  onClose: () => void;
  onSuccess: () => void;
  existingListing?: Listing;
}

export function UploadListingModal({ onClose, onSuccess, existingListing }: UploadListingModalProps) {
  const [formData, setFormData] = useState({
    title: existingListing?.title || '',
    description: existingListing?.description || '',
    address: existingListing?.address || '',
    price: existingListing?.price || 0,
    bedrooms: existingListing?.bedrooms || 1,
    bathrooms: existingListing?.bathrooms || 1,
    is_on_campus: existingListing?.is_on_campus || false,
    gender_preference: existingListing?.gender_preference || 'any',
    rental_type: existingListing?.rental_type || 'apartment',
    image_urls: existingListing?.image_urls.join('\n') || '',
    amenities: existingListing?.amenities || [] as string[],
    available_from: existingListing?.available_from || new Date().toISOString().split('T')[0],
    lease_duration: existingListing?.lease_duration || '12 months',
  });

  const [loading, setLoading] = useState(false);

  const handleAmenityToggle = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const imageUrlsArray = formData.image_urls
        .split('\n')
        .map((url) => url.trim())
        .filter((url) => url.length > 0);

      const listingData = {
        ...formData,
        image_urls: imageUrlsArray,
      };

      if (existingListing) {
        await listingService.updateListing(existingListing.id, listingData);
      } else {
        await listingService.createListing(listingData as any);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving listing:', error);
      alert('Failed to save listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="glass-panel rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 glass-header p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-100">
            {existingListing ? 'Edit Listing' : 'Upload New Listing'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 glass-icon-button"
          >
            <FaXmark size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="glass-input"
              placeholder="e.g., Spacious 2-Bedroom Apartment"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="glass-input"
              rows={4}
              placeholder="Describe your property..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Address *
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
              className="glass-input"
              placeholder="123 Main St, Ottawa, ON"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Price per Month * ($)
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                required
                min="0"
                className="glass-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Bedrooms *
              </label>
              <input
                type="number"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: Number(e.target.value) })}
                required
                min="1"
                className="glass-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Bathrooms *
              </label>
              <input
                type="number"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: Number(e.target.value) })}
                required
                min="1"
                step="0.5"
                className="glass-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Rental Type *
              </label>
              <select
                value={formData.rental_type}
                onChange={(e) => setFormData({ ...formData, rental_type: e.target.value as any })}
                className="glass-input"
              >
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="room">Room</option>
                <option value="basement">Basement</option>
                <option value="floor">Floor</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Available From *
              </label>
              <input
                type="date"
                value={formData.available_from}
                onChange={(e) => setFormData({ ...formData, available_from: e.target.value })}
                required
                className="glass-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Lease Duration
              </label>
              <input
                type="text"
                value={formData.lease_duration}
                onChange={(e) => setFormData({ ...formData, lease_duration: e.target.value })}
                className="glass-input"
                placeholder="e.g., 12 months"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Location Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={formData.is_on_campus}
                  onChange={() => setFormData({ ...formData, is_on_campus: true })}
                  className="mr-2 accent-blue-600"
                />
                <span className="text-sm text-gray-300">On Campus</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={!formData.is_on_campus}
                  onChange={() => setFormData({ ...formData, is_on_campus: false })}
                  className="mr-2 accent-blue-600"
                />
                <span className="text-sm text-gray-300">Off Campus</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Gender Preference
            </label>
            <select
              value={formData.gender_preference}
              onChange={(e) => setFormData({ ...formData, gender_preference: e.target.value as any })}
              className="glass-input"
            >
              <option value="any">Any</option>
              <option value="male">Male Only</option>
              <option value="female">Female Only</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Amenities
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['Parking', 'Laundry', 'Wi-Fi', 'Gym', 'Pool', 'Furnished', 'Pet Friendly'].map(
                (amenity) => (
                  <label key={amenity} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => handleAmenityToggle(amenity)}
                      className="mr-2 accent-blue-600"
                    />
                    <span className="text-sm text-gray-300">{amenity}</span>
                  </label>
                )
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Image URLs (one per line)
            </label>
            <textarea
              value={formData.image_urls}
              onChange={(e) => setFormData({ ...formData, image_urls: e.target.value })}
              className="glass-input font-mono text-sm"
              rows={4}
              placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter one image URL per line. Images should be publicly accessible.
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 glass-button-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 glass-button disabled:opacity-50"
            >
              {loading ? 'Saving...' : existingListing ? 'Update Listing' : 'Create Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
