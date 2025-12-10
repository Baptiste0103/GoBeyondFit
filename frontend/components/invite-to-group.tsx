'use client';

import { useState } from 'react';
import { Mail, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { authClient } from '@/lib/auth';

interface InviteToGroupProps {
  groupId: string;
  groupName: string;
}

export function InviteToGroup({ groupId, groupName }: InviteToGroupProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
  const token = authClient.getToken();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Pseudo is required' });
      return;
    }

    setLoading(true);
    try {
      // Search for user by pseudo
      const userResponse = await fetch(`${API_URL}/search/users?pseudo=${encodeURIComponent(email)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error('User not found');
      }

      const result = await userResponse.json();

      if (!result.found || !result.data) {
        throw new Error('User not found');
      }

      const user = result.data;

      // Now send the invitation
      const inviteResponse = await fetch(`${API_URL}/invitations`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId,
          toUserId: user.id,
        }),
      });

      if (inviteResponse.ok) {
        setMessage({ type: 'success', text: `Invitation sent to ${user.pseudo}!` });
        setEmail('');
        setTimeout(() => setMessage(null), 3000);
      } else {
        const error = await inviteResponse.json();
        throw new Error(error.message || 'Failed to send invitation');
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to send invitation',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Mail size={20} />
        Invite to "{groupName}"
      </h3>

      <form onSubmit={handleSendInvitation} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Student Pseudo</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student_pseudo"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg flex items-center gap-2 transition"
            >
              <Send size={16} />
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>

        {message && (
          <div className={`flex items-center gap-2 p-3 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
          }`}>
            {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
}
