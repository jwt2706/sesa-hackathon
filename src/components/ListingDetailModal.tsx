import { useState } from 'react';
import {
  FaXmark,
  FaChevronLeft,
  FaChevronRight,
  FaMapPin,
  FaBed,
  FaBath,
  FaDollarSign,
  FaCalendarDays,
} from 'react-icons/fa6';
import { Listing } from '../types/database';
import { useAuth } from '../contexts/AuthContext';
import { applicationService } from '../services/api';

interface ListingDetailModalProps {
  listing: Listing;
  onClose: () => void;
}

export function ListingDetailModal({ listing, onClose }: ListingDetailModalProps) {
  const { profile } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [message, setMessage] = useState('');
  const [applyMode, setApplyMode] = useState<'individual' | 'group' | null>(null);
  const [applying, setApplying] = useState(false);
  const [success, setSuccess] = useState(false);

  const images = listing.image_urls.length > 0
    ? listing.image_urls
    : ['https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg'];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleApply = async () => {
    if (!profile || profile.is_landlord) return;

    setApplying(true);
    try {
      const groupId = applyMode === 'group' ? profile.group_id : null;
      await applicationService.createApplication(listing.id, groupId, message);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error applying:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="glass-panel rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 glass-header p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-100">{listing.title}</h2>
          <button
            onClick={onClose}
            className="p-2 glass-icon-button"
          >
            <FaXmark size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="relative mb-6">
            <img
              src={images[currentImageIndex]}
              alt={`${listing.title} - Image ${currentImageIndex + 1}`}
              className="w-full h-96 object-cover object-center rounded-lg cursor-zoom-in"
              onClick={() => setIsImageExpanded(true)}
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 p-2 rounded-full hover:bg-black/60 transition-all"
                >
                  <FaChevronLeft size={24} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 p-2 rounded-full hover:bg-black/60 transition-all"
                >
                  <FaChevronRight size={24} />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="mb-6 flex gap-3 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-lg border transition-colors ${
                    index === currentImageIndex
                      ? 'border-blue-500/70'
                      : 'border-white/10'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${listing.title} thumbnail ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                  {index === currentImageIndex && (
                    <span className="absolute inset-0 bg-blue-500/10" />
                  )}
                </button>
              ))}
            </div>
          )}
          {isImageExpanded && (
            <div
              className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-6"
              onClick={() => setIsImageExpanded(false)}
            >
              <button
                type="button"
                onClick={() => setIsImageExpanded(false)}
                className="absolute top-6 right-6 h-10 w-10 glass-icon-button"
              >
                <FaXmark size={18} />
              </button>
              <img
                src={images[currentImageIndex]}
                alt={`${listing.title} - Expanded image ${currentImageIndex + 1}`}
                className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
                onClick={(event) => event.stopPropagation()}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FaDollarSign className="text-blue-300" size={24} />
                <div>
                  <p className="text-sm text-gray-400">Price</p>
                  <p className="text-2xl font-bold text-gray-100">${listing.price}/mo</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <FaMapPin className="text-blue-300" size={24} />
                <div>
                  <p className="text-sm text-gray-400">Address</p>
                  <p className="text-gray-100">{listing.address}</p>
                </div>
              </div>

              <div className="flex gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <FaBed className="text-gray-400" size={20} />
                  <span className="text-gray-100">{listing.bedrooms} Bedrooms</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaBath className="text-gray-400" size={20} />
                  <span className="text-gray-100">{listing.bathrooms} Bathrooms</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <FaCalendarDays className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm text-gray-400">Available From</p>
                  <p className="text-gray-100">{new Date(listing.available_from).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-2">Type</p>
                <span className="px-3 py-1 rounded-full text-sm capitalize glass-pill">
                  {listing.rental_type}
                </span>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-2">Location Type</p>
                <span className="px-3 py-1 bg-white/5 text-gray-300 rounded-full text-sm border border-white/10">
                  {listing.is_on_campus ? 'On Campus' : 'Off Campus'}
                </span>
              </div>

              {listing.gender_preference !== 'any' && (
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-2">Gender Preference</p>
                  <span className="px-3 py-1 bg-white/5 text-gray-300 rounded-full text-sm border border-white/10 capitalize">
                    {listing.gender_preference} Only
                  </span>
                </div>
              )}

              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-2">Lease Duration</p>
                <p className="text-gray-100">{listing.lease_duration}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-2">Description</h3>
            <p className="text-gray-300 whitespace-pre-wrap">{listing.description}</p>
          </div>

          {listing.amenities.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-100 mb-2">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {listing.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="px-3 py-1 bg-white/5 text-gray-300 rounded-full text-sm border border-white/10"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {profile && !profile.is_landlord && (
            <div className="border-t border-white/10 pt-6">
              {success ? (
                <div className="bg-green-900/40 text-green-200 p-4 rounded-lg text-center border border-green-500/30">
                  Application submitted successfully!
                </div>
              ) : !applyMode ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-100">Apply for this listing</h3>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setApplyMode('individual')}
                      className="flex-1 py-3 glass-button"
                    >
                      Apply as Individual
                    </button>
                    <button
                      onClick={() => {
                        if (profile.group_id) {
                          setApplyMode('group');
                        } else {
                          alert('You need to join a group first!');
                        }
                      }}
                      className="flex-1 py-3 glass-button-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!profile.group_id}
                    >
                      Apply as Group
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-100">
                    Application {applyMode === 'group' ? '(Group)' : '(Individual)'}
                  </h3>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell the landlord why you'd be a great tenant..."
                    className="glass-input px-4 py-3"
                    rows={4}
                  />
                  <div className="flex gap-4">
                    <button
                      onClick={() => setApplyMode(null)}
                      className="flex-1 py-3 glass-button-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleApply}
                      disabled={applying}
                      className="flex-1 py-3 glass-button disabled:opacity-50"
                    >
                      {applying ? 'Submitting...' : 'Submit Application'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
