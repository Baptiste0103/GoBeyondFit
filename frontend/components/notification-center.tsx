'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle, XCircle, Trash2, Check, X, ArrowLeft } from 'lucide-react';
import { authClient } from '@/lib/auth';

interface Notification {
  id: string;
  type: 'invitation' | 'assignment' | 'program' | 'message' | 'system';
  title: string;
  message: string;
  senderName?: string;
  senderEmail?: string;
  createdAt: string;
  read: boolean;
  actionable?: boolean;
  invitationId?: string;
  groupId?: string;
}

export function NotificationCenter() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
  const router = useRouter();
  const token = authClient.getToken();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'invitations' | 'assignments'>('all');

  // Load notifications on mount
  useEffect(() => {
    if (token) {
      loadNotifications();
    }
  }, [token]);

  const loadNotifications = async () => {
    if (!token) {
      setError('Session expired. Please log in again.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Load received invitations
      const invitationsResponse = await fetch(`${API_URL}/invitations/received`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!invitationsResponse.ok) {
        throw new Error('Failed to load invitations');
      }

      const invitations = await invitationsResponse.json();
      
      // Transform invitations to notifications
      const invitationNotifications = invitations.map((inv: any) => ({
        id: inv.id,
        type: 'invitation' as const,
        title: 'Invitation de groupe',
        message: `${inv.fromCoach?.pseudo || 'Un coach'} vous a invité à rejoindre le groupe "${inv.group?.name}"`,
        senderName: inv.fromCoach?.pseudo,
        senderEmail: inv.fromCoach?.email,
        createdAt: inv.createdAt,
        read: inv.status !== 'pending',
        actionable: inv.status === 'pending',
        invitationId: inv.id,
        groupId: inv.groupId,
      }));

      // Load all notifications (including assignments)
      const notificationsResponse = await fetch(`${API_URL}/notifications/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      let assignmentNotifications = [];
      if (notificationsResponse.ok) {
        const notifications = await notificationsResponse.json();
        
        // Transform assignment notifications
        assignmentNotifications = notifications
          .filter((notif: any) => notif.type === 'assignment')
          .map((notif: any) => {
            const payload = notif.payload as any;
            return {
              id: notif.id,
              type: 'assignment' as const,
              title: 'Programme assigné',
              message: `${payload?.coachPseudo || 'Un coach'} vous a assigné le programme "${payload?.programTitle || 'Programme'}"`,
              senderName: payload?.coachPseudo,
              senderEmail: undefined,
              createdAt: payload?.assignedAt || notif.createdAt,
              read: notif.read,
              actionable: false,
            };
          });
      }

      // Combine all notifications
      const allNotifications = [
        ...invitationNotifications,
        ...assignmentNotifications,
      ];

      setNotifications(allNotifications);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async (invitationId: string) => {
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/invitations/${invitationId}/accept`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to accept invitation');
      }
      
      // Remove invitation from list and show success message
      setNotifications(prev => prev.filter(n => n.invitationId !== invitationId));
      setSuccess('✅ Invitation accepted! You have been added to the group.');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept invitation');
      setSuccess('');
    }
  };

  const handleRejectInvitation = async (invitationId: string) => {
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/invitations/${invitationId}/reject`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to reject invitation');
      }
      
      // Remove invitation from list and show success message
      setNotifications(prev => prev.filter(n => n.invitationId !== invitationId));
      setSuccess('❌ Invitation rejected.');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject invitation');
      setSuccess('');
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    if (!token) return;

    try {
      const notif = notifications.find(n => n.id === notificationId);
      if (!notif) return;

      // For assignment and system notifications, call /notifications/{id}/read
      if (notif.type === 'assignment' || notif.type === 'system') {
        await fetch(`${API_URL}/notifications/${notificationId}/read`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }

      // Update local state
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (err) {
      // Silently fail - don't show error for mark as read
      console.error('Failed to mark as read:', err);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    if (!token) return;

    try {
      const notif = notifications.find(n => n.id === notificationId);
      
      if (!notif) return;

      // Delete invitation if it's an invitation notification
      if (notif.invitationId && notif.type === 'invitation') {
        await fetch(`${API_URL}/invitations/${notif.invitationId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else if (notif.type === 'assignment' || notif.type === 'system') {
        // Delete notification from database
        await fetch(`${API_URL}/notifications/${notificationId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setSuccess('✅ Notification supprimée');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete notification');
    }
  };

  const getFilteredNotifications = () => {
    return notifications.filter(notif => {
      if (filter === 'unread') return !notif.read;
      if (filter === 'invitations') return notif.type === 'invitation';
      if (filter === 'assignments') return notif.type === 'assignment';
      return true;
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'invitation':
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case 'assignment':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'system':
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getNotificationColor = (type: string, read: boolean) => {
    if (read) return 'bg-gray-50 border-gray-200';
    
    switch (type) {
      case 'invitation':
        return 'bg-blue-50 border-blue-200';
      case 'assignment':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
            title="Back to dashboard"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-1">Votre boîte aux lettres - Invitations, assignations et messages</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadNotifications}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            🔄 Actualiser
          </button>
          {unreadCount > 0 && (
            <span className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
              {unreadCount} nouveau{unreadCount > 1 ? 'x' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900">Erreur</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-900">Succès</p>
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {['all', 'unread', 'invitations', 'assignments'].map((tab) => {
          const assignmentCount = notifications.filter(n => n.type === 'assignment').length;
          
          return (
            <button
              key={tab}
              onClick={() => setFilter(tab as any)}
              className={`px-4 py-3 font-medium border-b-2 transition ${
                filter === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'all' && 'Tous'}
              {tab === 'unread' && `Non lus (${unreadCount})`}
              {tab === 'invitations' && 'Invitations'}
              {tab === 'assignments' && `Assignations (${assignmentCount})`}
            </button>
          );
        })}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="text-gray-600 mt-2">Chargement des notifications...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto" />
          <p className="text-gray-600 mt-2">
            {filter === 'unread' ? 'Aucune notification non lue' : 'Aucune notification'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              onMouseEnter={() => handleMarkAsRead(notification.id)}
              onClick={() => handleMarkAsRead(notification.id)}
              className={`border rounded-lg p-4 transition cursor-pointer hover:shadow-md ${getNotificationColor(
                notification.type,
                notification.read
              )}`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold ${notification.read ? 'text-gray-600' : 'text-gray-900'}`}>
                    {notification.title}
                  </p>
                  <p className="text-gray-700 mt-1 text-sm">{notification.message}</p>
                  {notification.senderName && (
                    <p className="text-gray-600 text-xs mt-1">
                      De: {notification.senderName} {notification.senderEmail && `(${notification.senderEmail})`}
                    </p>
                  )}
                  <p className="text-gray-500 text-xs mt-2">
                    {new Date(notification.createdAt).toLocaleString('fr-FR')}
                  </p>

                  {/* Action Buttons */}
                  {notification.actionable && notification.type === 'invitation' && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcceptInvitation(notification.invitationId!);
                        }}
                        className="px-3 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition flex items-center gap-1"
                      >
                        <Check className="w-4 h-4" />
                        Accepter
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRejectInvitation(notification.invitationId!);
                        }}
                        className="px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition flex items-center gap-1"
                      >
                        <X className="w-4 h-4" />
                        Rejeter
                      </button>
                    </div>
                  )}
                </div>

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNotification(notification.id);
                  }}
                  className="flex-shrink-0 text-gray-400 hover:text-red-600 transition"
                  title="Supprimer"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
