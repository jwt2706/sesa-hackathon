import { useState, useEffect } from 'react';
import {
  FaXmark,
  FaMapPin,
  FaDollarSign,
  FaCircleCheck,
  FaCircleXmark,
  FaClock,
} from 'react-icons/fa6';
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
        return <FaCircleCheck className="text-green-600" size={20} />;
      case 'rejected':
        return <FaCircleXmark className="text-red-600" size={20} />;
      default:
        return <FaClock className="text-yellow-600" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-900/40 text-green-200 border border-green-500/30';
      case 'rejected':
        return 'bg-red-900/40 text-red-200 border border-red-500/30';
      default:
        return 'bg-yellow-900/40 text-yellow-200 border border-yellow-500/30';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="glass-panel rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 glass-header p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-100">Application Status</h2>
          <button
            onClick={onClose}
            className="p-2 glass-icon-button"
          >
            <FaXmark size={24} />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading applications...</div>
          ) : applications.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              You haven't applied to any listings yet.
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="glass-card rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-100">
                        {app.listings.title}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
                        <FaMapPin size={14} />
                        <span>{app.listings.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
                        <FaDollarSign size={14} />
                        <span>${app.listings.price}/mo</span>
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getStatusColor(app.status)}`}>
                      {getStatusIcon(app.status)}
                      <span className="text-sm font-semibold capitalize">{app.status}</span>
                    </div>
                  </div>

                  {app.message && (
                    <div className="bg-white/5 border border-white/10 p-3 rounded-lg mb-2">
                      <p className="text-sm text-gray-300">{app.message}</p>
                    </div>
                  )}

                  {app.group_id && (
                    <div className="flex items-center gap-2 text-sm text-blue-200">
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
