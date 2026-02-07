import { useEffect, useMemo, useState } from 'react';
import { FaXmark } from 'react-icons/fa6';
import { listingService } from '../services/api';
import { supabase } from '../lib/supabase';
import { Listing } from '../types/database';

interface UploadListingModalProps {
  onClose: () => void;
  onSuccess: () => void;
  existingListing?: Listing;
}

export function UploadListingModal({ onClose, onSuccess, existingListing }: UploadListingModalProps) {
  const leaseOptions = ['4 months', '8 months', '12 months', '16 months'];
  const buildFormData = (listing?: Listing) => {
    const leaseDuration = leaseOptions.includes(listing?.lease_duration ?? '')
      ? listing?.lease_duration ?? '12 months'
      : '12 months';

    return {
      title: listing?.title || '',
      description: listing?.description || '',
      address: listing?.address || '',
      price: listing?.price || 0,
      bedrooms: listing?.bedrooms || 1,
      bathrooms: listing?.bathrooms || 1,
      is_on_campus: listing?.is_on_campus || false,
      gender_preference: listing?.gender_preference || 'any',
      rental_type: listing?.rental_type || 'apartment',
      amenities: listing?.amenities || ([] as string[]),
      available_from: listing?.available_from || new Date().toISOString().split('T')[0],
      lease_duration: leaseDuration,
    };
  };
  const createUploadId = () => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  };
  const [formData, setFormData] = useState(buildFormData(existingListing));

  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [expandedPreview, setExpandedPreview] = useState<string | null>(null);
  const imagePreviews = useMemo(
    () => imageFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    })),
    [imageFiles]
  );

  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [imagePreviews]);

  useEffect(() => {
    setFormData(buildFormData(existingListing));
    setImageFiles([]);
    setExpandedPreview(null);
  }, [existingListing?.id]);

  const handleAmenityToggle = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const uploadListingImages = async () => {
    if (imageFiles.length === 0) return [] as string[];

    const uploadedUrls: string[] = [];

    for (const file of imageFiles) {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${createUploadId()}-${Date.now()}.${fileExt}`;
      const filePath = `listing-images/${fileName}`;

      const { error: uploadError } = await supabase
        .storage
        .from('listings')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('listings').getPublicUrl(filePath);
      uploadedUrls.push(data.publicUrl);
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const uploadedImageUrls = await uploadListingImages();
      const existingImageUrls = existingListing?.image_urls ?? [];
      const imageUrlsArray = [...existingImageUrls, ...uploadedImageUrls];

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
              <select
                value={formData.lease_duration}
                onChange={(e) => setFormData({ ...formData, lease_duration: e.target.value })}
                className="glass-input"
              >
                {leaseOptions.map((duration) => (
                  <option key={duration} value={duration}>
                    {duration}
                  </option>
                ))}
              </select>
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
              Listing Images
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              className="glass-input"
              onChange={(e) => {
                const selected = Array.from(e.target.files ?? []);
                if (selected.length === 0) return;
                setImageFiles((prev) => {
                  const combined = [...prev, ...selected];
                  const unique = new Map(
                    combined.map((file) => [
                      `${file.name}-${file.size}-${file.lastModified}`,
                      file,
                    ])
                  );
                  return Array.from(unique.values());
                });
              }}
            />
            {existingListing?.image_urls?.length ? (
              <p className="text-xs text-gray-500 mt-2">
                Existing images: {existingListing.image_urls.length}. New uploads will be added.
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-2">
                Upload one or more images. PNG or JPG recommended.
              </p>
            )}
            {imagePreviews.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-3">
                {imagePreviews.map(({ file, url }) => (
                  <div key={url} className="relative">
                    <button
                      type="button"
                      onClick={() => setExpandedPreview(url)}
                      className="h-24 w-full rounded-lg overflow-hidden border border-white/10"
                    >
                      <img
                        src={url}
                        alt={file.name}
                        className="h-full w-full object-cover object-center"
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setImageFiles((prev) =>
                          prev.filter((item) => item !== file)
                        )
                      }
                      className="absolute top-1 right-1 h-7 w-7 text-xs glass-icon-button"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
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
      {expandedPreview && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6"
          onClick={() => setExpandedPreview(null)}
        >
          <button
            type="button"
            onClick={() => setExpandedPreview(null)}
            className="absolute top-6 right-6 h-10 w-10 glass-icon-button"
          >
            <FaXmark size={18} />
          </button>
          <img
            src={expandedPreview}
            alt="Listing preview"
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
