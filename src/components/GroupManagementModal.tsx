import { useState, useEffect } from 'react';
import { FaXmark, FaUsers, FaUserPlus } from 'react-icons/fa6';
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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="glass-panel rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 glass-header p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-100">Group Management</h2>
          <button
            onClick={onClose}
            className="p-2 glass-icon-button"
          >
            <FaXmark size={24} />
          </button>
        </div>

        <div className="p-6">
          {mode === 'create' ? (
            <div className="space-y-4">
              <div className="text-center py-4">
                <FaUserPlus size={48} className="mx-auto text-blue-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-100 mb-2">
                  Create or Join a Group
                </h3>
                <p className="text-gray-400 mb-6">
                  Groups allow you to apply for housing together with other students.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Group Name
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="glass-input"
                  placeholder="e.g., Engineering Students 2024"
                />
              </div>

              <button
                onClick={handleCreateGroup}
                disabled={loading || !groupName.trim()}
                className="w-full py-3 glass-button disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Group'}
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-400">
                  To join an existing group, ask a group member to share their Group ID with you.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="glass-card p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FaUsers className="text-blue-300" size={24} />
                  <h3 className="text-lg font-semibold text-gray-100">Your Group</h3>
                </div>
                <p className="text-sm text-gray-300 mb-2">
                  Group ID: <code className="bg-white/10 px-2 py-1 rounded text-xs">{profile?.group_id}</code>
                </p>
                <p className="text-xs text-gray-500">
                  Share this ID with others to invite them to your group
                </p>
              </div>

              {loading ? (
                <div className="text-center py-8 text-gray-400">Loading members...</div>
              ) : (
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-3">
                    Group Members ({groupMembers.length})
                  </h4>
                  <div className="space-y-2">
                    {groupMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg"
                      >
                        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                          <FaUsers size={20} className="text-blue-300" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-100">{member.name}</p>
                          <p className="text-sm text-gray-400">{member.email}</p>
                        </div>
                        {member.id === profile?.id && (
                          <span className="text-xs glass-pill px-2 py-1 rounded-full">
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
                className="w-full py-3 bg-red-900/60 text-red-200 rounded-lg border border-red-500/40 hover:bg-red-900/80 transition-colors disabled:opacity-50"
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
