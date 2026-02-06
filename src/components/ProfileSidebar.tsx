import { FaUser, FaUsers, FaFileLines } from 'react-icons/fa6';
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
    <div className="glass-card rounded-lg p-6 h-fit">
      <div className="flex flex-col items-center mb-6">
        <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-3">
          <FaUser size={40} className="text-blue-200" />
        </div>
        <h3 className="text-lg font-semibold text-gray-100">{profile.name}</h3>
        <p className="text-sm text-gray-400">{profile.email}</p>
        {profile.is_landlord && (
          <span className="mt-2 px-3 py-1 bg-green-900/40 text-green-200 text-xs font-semibold rounded-full border border-green-500/30">
            Landlord
          </span>
        )}
      </div>

      {profile.description && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-300 mb-2">Bio</h4>
          <p className="text-sm text-gray-400">{profile.description}</p>
        </div>
      )}

      {profile.phone && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-300 mb-2">Phone</h4>
          <p className="text-sm text-gray-400">{profile.phone}</p>
        </div>
      )}

      <div className="space-y-3">
        {!profile.is_landlord ? (
          <>
            <button
              onClick={onGroupClick}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 glass-button"
            >
              <FaUsers size={18} />
              Do you have a group?
            </button>
            <button
              onClick={onApplicationStatusClick}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 glass-button-secondary"
            >
              <FaFileLines size={18} />
              Application Status
            </button>
          </>
        ) : (
          <button
            onClick={onUploadListingClick}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 glass-button"
          >
            <FaFileLines size={18} />
            Upload Listing
          </button>
        )}
      </div>
    </div>
  );
}
