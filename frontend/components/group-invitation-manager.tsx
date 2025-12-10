'use client';

import { useState, useEffect } from 'react';
import { Plus, Send, X, CheckCircle, XCircle, Clock } from 'lucide-react';
import { authClient } from '@/lib/auth';

interface User {
  id: string;
  pseudo: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface Group {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
}

interface Invitation {
  id: string;
  groupId: string;
  toUserId: string;
  fromCoachId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  respondedAt?: string;
  toUser?: User;
  fromCoach?: User;
  group?: Group;
}

interface GroupInvitationManagerProps {
  groupId?: string;
}

export function GroupInvitationManager({ groupId }: GroupInvitationManagerProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(false);
  const [activeTab, setActiveTab] = useState<'send' | 'manage'>('send');

  const token = authClient.getToken();

  // Search users for invitation
  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setAvailableUsers([]);
      return;
    }

    if (!token) {
      setError('Session expired. Please log in again.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/search/users?pseudo=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.found && result.data) {
          setAvailableUsers(Array.isArray(result.data) ? result.data : [result.data]);
          setError(null);
        } else {
          setAvailableUsers([]);
          setError('User not found');
        }
      } else {
        setError('Error searching users');
        setAvailableUsers([]);
      }
    } catch (err) {
      console.error('Error searching users:', err);
      setError('Error searching users');
      setAvailableUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Load sent invitations
  const loadInvitations = async () => {
    if (!token) return;

    try {
      setLoadingInvitations(true);
      const response = await fetch(`${API_URL}/invitations/sent`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setInvitations(data);
      }
    } catch (err) {
      console.error('Error loading invitations:', err);
    } finally {
      setLoadingInvitations(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'manage') {
      loadInvitations();
    }
  }, [activeTab]);

  // Send invitations
  const handleSendInvitations = async () => {
    if (!groupId) {
      setError('Group ID is required');
      return;
    }

    if (selectedUsers.length === 0) {
      setError('Please select at least one user');
      return;
    }

    if (!token) {
      setError('Session expired. Please log in again.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Send invitations for each selected user
      const promises = selectedUsers.map((userId) =>
        fetch(`${API_URL}/invitations`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            groupId,
            toUserId: userId,
          }),
        })
      );

      const responses = await Promise.all(promises);
      const allSuccess = responses.every((res) => res.ok);

      if (allSuccess) {
        setSuccess(`${selectedUsers.length} invitation(s) sent successfully!`);
        setSelectedUsers([]);
        setAvailableUsers([]);
        setSearchQuery('');
        await loadInvitations();
      } else {
        setError('Failed to send some invitations');
      }
    } catch (err) {
      console.error('Error sending invitations:', err);
      setError('Error sending invitations');
    } finally {
      setLoading(false);
    }
  };

  // Delete invitation
  const handleDeleteInvitation = async (invitationId: string) => {
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/invitations/${invitationId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setInvitations(invitations.filter((inv) => inv.id !== invitationId));
        setSuccess('Invitation deleted');
      } else {
        setError('Failed to delete invitation');
      }
    } catch (err) {
      console.error('Error deleting invitation:', err);
      setError('Error deleting invitation');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Group Invitations</h2>
        <p className="text-gray-600">Send and manage group invitations for your students</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('send')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'send'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Send Invitations
        </button>
        <button
          onClick={() => setActiveTab('manage')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'manage'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Manage Invitations
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <XCircle className="text-red-600 flex-shrink-0" size={20} />
          <div className="text-red-600 text-sm">{error}</div>
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
          <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
          <div className="text-green-600 text-sm">{success}</div>
        </div>
      )}

      {/* Send Invitations Tab */}
      {activeTab === 'send' && (
        <div className="space-y-4">
          {/* User Search */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Search Users by Pseudo
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter user pseudo"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  searchUsers(e.target.value);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Available Users */}
          {availableUsers.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Found Users</h3>
              <div className="space-y-2">
                {availableUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-200"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{user.pseudo}</div>
                      <div className="text-sm text-gray-600">{user.email}</div>
                    </div>
                    <button
                      onClick={() => {
                        if (selectedUsers.includes(user.id)) {
                          setSelectedUsers(selectedUsers.filter((id) => id !== user.id));
                        } else {
                          setSelectedUsers([...selectedUsers, user.id]);
                        }
                      }}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        selectedUsers.includes(user.id)
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-blue-600 text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      {selectedUsers.includes(user.id) ? '✓ Selected' : 'Select'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                Selected Users ({selectedUsers.length})
              </h3>
              <div className="space-y-2">
                {selectedUsers.map((userId) => {
                  const user = availableUsers.find((u) => u.id === userId);
                  return (
                    <div
                      key={userId}
                      className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-300"
                    >
                      <div>
                        <div className="font-medium text-gray-900">{user?.pseudo}</div>
                      </div>
                      <button
                        onClick={() =>
                          setSelectedUsers(selectedUsers.filter((id) => id !== userId))
                        }
                        className="text-red-600 hover:text-red-700"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Send Button */}
          <button
            onClick={handleSendInvitations}
            disabled={loading || selectedUsers.length === 0}
            className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition"
          >
            <Send size={18} />
            {loading ? 'Sending...' : `Send Invitations (${selectedUsers.length})`}
          </button>
        </div>
      )}

      {/* Manage Invitations Tab */}
      {activeTab === 'manage' && (
        <div className="space-y-4">
          {loadingInvitations ? (
            <div className="flex justify-center items-center py-8">
              <div className="h-10 w-10 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : invitations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No invitations sent yet</div>
          ) : (
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      {invitation.toUser?.pseudo} ({invitation.toUser?.email})
                    </div>
                    <div className="text-sm text-gray-600">
                      Group: {invitation.group?.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Sent: {new Date(invitation.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      {invitation.status === 'pending' && (
                        <>
                          <Clock size={16} className="text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-600">Pending</span>
                        </>
                      )}
                      {invitation.status === 'accepted' && (
                        <>
                          <CheckCircle size={16} className="text-green-600" />
                          <span className="text-sm font-medium text-green-600">Accepted</span>
                        </>
                      )}
                      {invitation.status === 'rejected' && (
                        <>
                          <XCircle size={16} className="text-red-600" />
                          <span className="text-sm font-medium text-red-600">Rejected</span>
                        </>
                      )}
                    </div>

                    {/* Delete Button */}
                    {invitation.status === 'pending' && (
                      <button
                        onClick={() => handleDeleteInvitation(invitation.id)}
                        className="text-red-600 hover:text-red-700 transition"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
