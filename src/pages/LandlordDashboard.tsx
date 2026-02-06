import { useState, useEffect } from 'react';
import { LogOut, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { listingService, applicationService } from '../services/api';
import { Listing, ListingFilters } from '../types/database';
import { ProfileSidebar } from '../components/ProfileSidebar';
import { FilterSidebar } from '../components/FilterSidebar';
import { ListingCard } from '../components/ListingCard';
import { ListingDetailModal } from '../components/ListingDetailModal';
import { UploadListingModal } from '../components/UploadListingModal';

type TabType = 'applications' | 'compare';

export function LandlordDashboard() {
  const { profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('applications');
  const [listings, setListings] = useState<Listing[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [filters, setFilters] = useState<ListingFilters>({});

  useEffect(() => {
    if (activeTab === 'applications') {
      loadApplications();
    } else {
      loadListings();
    }
  }, [activeTab, filters]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const data = await applicationService.getApplicationsForLandlord();
      setApplications(data);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleUpdateApplicationStatus = async (
    applicationId: string,
    status: 'accepted' | 'rejected'
  ) => {
    try {
      await applicationService.updateApplicationStatus(applicationId, status);
      loadApplications();
    } catch (error) {
      console.error('Error updating application:', error);
      alert('Failed to update application status');
    }
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-900">UOttaLive</h1>
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3">
            <ProfileSidebar
              profile={profile}
              onUploadListingClick={() => setShowUploadModal(true)}
            />
          </div>

          <div className="col-span-6">
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab('applications')}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
                  activeTab === 'applications'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Applications
              </button>
              <button
                onClick={() => setActiveTab('compare')}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
                  activeTab === 'compare'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Compare Listings
              </button>
            </div>

            {activeTab === 'applications' ? (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Applications to Your Listings
                </h2>

                {loading ? (
                  <div className="text-center py-12 text-gray-600">Loading applications...</div>
                ) : applications.length === 0 ? (
                  <div className="text-center py-12 text-gray-600">
                    No applications yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((app) => (
                      <div
                        key={app.id}
                        className="bg-white rounded-lg shadow-md p-4"
                      >
                        <div className="mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {app.listings.title}
                          </h3>
                          <p className="text-sm text-gray-600">{app.listings.address}</p>
                        </div>

                        <div className="border-t border-gray-200 pt-3 mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-semibold text-gray-900">
                                {app.profiles.name}
                              </p>
                              <p className="text-sm text-gray-600">{app.profiles.email}</p>
                              {app.profiles.phone && (
                                <p className="text-sm text-gray-600">{app.profiles.phone}</p>
                              )}
                            </div>
                            {app.group_id && (
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                Group Application
                              </span>
                            )}
                          </div>

                          {app.message && (
                            <div className="bg-gray-50 p-3 rounded-lg mb-3">
                              <p className="text-sm text-gray-700">{app.message}</p>
                            </div>
                          )}

                          <div className="text-xs text-gray-500 mb-3">
                            Applied on {new Date(app.created_at).toLocaleDateString()}
                          </div>
                        </div>

                        {app.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateApplicationStatus(app.id, 'accepted')}
                              className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <CheckCircle size={18} />
                              Accept
                            </button>
                            <button
                              onClick={() => handleUpdateApplicationStatus(app.id, 'rejected')}
                              className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
                            >
                              <XCircle size={18} />
                              Reject
                            </button>
                          </div>
                        )}

                        {app.status !== 'pending' && (
                          <div
                            className={`text-center py-2 rounded-lg font-semibold ${
                              app.status === 'accepted'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {app.status === 'accepted' ? 'Accepted' : 'Rejected'}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  All Listings
                </h2>

                {loading ? (
                  <div className="text-center py-12 text-gray-600">Loading listings...</div>
                ) : listings.length === 0 ? (
                  <div className="text-center py-12 text-gray-600">
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
            )}
          </div>

          <div className="col-span-3">
            {activeTab === 'compare' && <FilterSidebar onFilterChange={setFilters} />}
          </div>
        </div>
      </div>

      {selectedListing && (
        <ListingDetailModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
        />
      )}

      {showUploadModal && (
        <UploadListingModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            if (activeTab === 'compare') {
              loadListings();
            }
          }}
        />
      )}
    </div>
  );
}
