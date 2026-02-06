import { User, Users, FileText } from 'lucide-react';
import { Profile } from '../types/database';

interface ProfileSidebarProps {
  profile: Profile;
  onGroupClick?: () => void;
  onApplicationStatusClick?: () => void;
  onUploadListingClick?: () => void;
}

export function ProfileSidebar({
  profile,
  onGroupClick,
  onApplicationStatusClick,
  onUploadListingClick,
}: ProfileSidebarProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-fit">
      <div className="flex flex-col items-center mb-6">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-3">
          <User size={40} className="text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{profile.name}</h3>
        <p className="text-sm text-gray-600">{profile.email}</p>
        {profile.is_landlord && (
          <span className="mt-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
            Landlord
          </span>
        )}
      </div>

      {profile.description && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Bio</h4>
          <p className="text-sm text-gray-600">{profile.description}</p>
        </div>
      )}

      {profile.phone && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Phone</h4>
          <p className="text-sm text-gray-600">{profile.phone}</p>
        </div>
      )}

      <div className="space-y-3">
        {!profile.is_landlord ? (
          <>
            <button
              onClick={onGroupClick}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Users size={18} />
              Do you have a group?
            </button>
            <button
              onClick={onApplicationStatusClick}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FileText size={18} />
              Application Status
            </button>
          </>
        ) : (
          <button
            onClick={onUploadListingClick}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FileText size={18} />
            Upload Listing
          </button>
        )}
      </div>
    </div>
  );
}
