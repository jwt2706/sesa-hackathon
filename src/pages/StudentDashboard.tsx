import { useState, useEffect } from 'react';
import { FaRightFromBracket } from 'react-icons/fa6';
import { useAuth } from '../contexts/AuthContext';
import { listingService } from '../services/api';
import { Listing, ListingFilters } from '../types/database';
import { ProfileSidebar } from '../components/ProfileSidebar';
import { FilterSidebar } from '../components/FilterSidebar';
import { ListingCard } from '../components/ListingCard';
import { ListingDetailModal } from '../components/ListingDetailModal';
import { ApplicationStatusModal } from '../components/ApplicationStatusModal';
import { GroupManagementModal } from '../components/GroupManagementModal';

export function StudentDashboard() {
  const { profile, signOut } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showApplicationStatus, setShowApplicationStatus] = useState(false);
  const [showGroupManagement, setShowGroupManagement] = useState(false);
  const [filters, setFilters] = useState<ListingFilters>({});

  useEffect(() => {
    loadListings();
  }, [filters]);

  const loadListings = async () => {
    setLoading(true);
    try {
      const data = await listingService.getListings(filters);
      setListings(data);
    } catch (error) {
      console.error('Error loading listings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen">

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3">
            <ProfileSidebar
              profile={profile}
              onGroupClick={() => setShowGroupManagement(true)}
              onApplicationStatusClick={() => setShowApplicationStatus(true)}
            />
          </div>

          <div className="col-span-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">
              Available Listings
            </h2>

            {loading ? (
              <div className="text-center py-12 text-gray-400">Loading listings...</div>
            ) : listings.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                No listings found matching your filters.
              </div>
            ) : (
              <div className="space-y-4">
                {listings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    onViewClick={setSelectedListing}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="col-span-3">
            <FilterSidebar onFilterChange={setFilters} />
          </div>
        </div>
      </div>

      {selectedListing && (
        <ListingDetailModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
        />
      )}

      {showApplicationStatus && (
        <ApplicationStatusModal onClose={() => setShowApplicationStatus(false)} />
      )}

      {showGroupManagement && (
        <GroupManagementModal onClose={() => setShowGroupManagement(false)} />
      )}
    </div>
  );
}
