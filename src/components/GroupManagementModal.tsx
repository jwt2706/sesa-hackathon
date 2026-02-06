import { useState, useEffect } from 'react';
import { X, Users, UserPlus } from 'lucide-react';
import { groupService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Profile } from '../types/database';

interface GroupManagementModalProps {
  onClose: () => void;
}

export function GroupManagementModal({ onClose }: GroupManagementModalProps) {
  const { profile, refreshProfile } = useAuth();
  const [groupMembers, setGroupMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [mode, setMode] = useState<'view' | 'create'>('view');

  useEffect(() => {
    if (profile?.group_id) {
      loadGroupMembers();
    } else {
      setMode('create');
    }
  }, [profile]);

  const loadGroupMembers = async () => {
    if (!profile?.group_id) return;

    setLoading(true);
    try {
      const members = await groupService.getGroupMembers(profile.group_id);
      setGroupMembers(members);
    } catch (error) {
      console.error('Error loading group members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      alert('Please enter a group name');
      return;
    }

    setLoading(true);
    try {
      await groupService.createGroup(groupName);
      await refreshProfile();
      setMode('view');
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Failed to create group. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!confirm('Are you sure you want to leave this group?')) return;

    setLoading(true);
    try {
      await groupService.leaveGroup();
      await refreshProfile();
      onClose();
    } catch (error) {
      console.error('Error leaving group:', error);
      alert('Failed to leave group. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Group Management</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {mode === 'create' ? (
            <div className="space-y-4">
              <div className="text-center py-4">
                <UserPlus size={48} className="mx-auto text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Create or Join a Group
                </h3>
                <p className="text-gray-600 mb-6">
                  Groups allow you to apply for housing together with other students.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group Name
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Engineering Students 2024"
                />
              </div>

              <button
                onClick={handleCreateGroup}
                disabled={loading || !groupName.trim()}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Group'}
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  To join an existing group, ask a group member to share their Group ID with you.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="text-blue-600" size={24} />
                  <h3 className="text-lg font-semibold text-gray-900">Your Group</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Group ID: <code className="bg-white px-2 py-1 rounded text-xs">{profile?.group_id}</code>
                </p>
                <p className="text-xs text-gray-500">
                  Share this ID with others to invite them to your group
                </p>
              </div>

              {loading ? (
                <div className="text-center py-8 text-gray-600">Loading members...</div>
              ) : (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    Group Members ({groupMembers.length})
                  </h4>
                  <div className="space-y-2">
                    {groupMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users size={20} className="text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{member.name}</p>
                          <p className="text-sm text-gray-600">{member.email}</p>
                        </div>
                        {member.id === profile?.id && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            You
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleLeaveGroup}
                disabled={loading}
                className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Leaving...' : 'Leave Group'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
