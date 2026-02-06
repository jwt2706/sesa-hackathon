import { useState, useEffect } from 'react';
import { X, MapPin, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';
import { applicationService } from '../services/api';

interface ApplicationStatusModalProps {
  onClose: () => void;
}

export function ApplicationStatusModal({ onClose }: ApplicationStatusModalProps) {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const data = await applicationService.getMyApplications();
      setApplications(data);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'rejected':
        return <XCircle className="text-red-600" size={20} />;
      default:
        return <Clock className="text-yellow-600" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Application Status</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8 text-gray-600">Loading applications...</div>
          ) : applications.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              You haven't applied to any listings yet.
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {app.listings.title}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
                        <MapPin size={14} />
                        <span>{app.listings.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
                        <DollarSign size={14} />
                        <span>${app.listings.price}/mo</span>
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getStatusColor(app.status)}`}>
                      {getStatusIcon(app.status)}
                      <span className="text-sm font-semibold capitalize">{app.status}</span>
                    </div>
                  </div>

                  {app.message && (
                    <div className="bg-gray-50 p-3 rounded-lg mb-2">
                      <p className="text-sm text-gray-700">{app.message}</p>
                    </div>
                  )}

                  {app.group_id && (
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <span className="font-semibold">Group Application</span>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 mt-2">
                    Applied on {new Date(app.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
