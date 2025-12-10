'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { authClient } from '@/lib/auth'

export default function Sidebar() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || ''
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [role, setRole] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const token = authClient.getToken()

  useEffect(() => {
    const userRole = localStorage.getItem('userRole')
    setRole(userRole)
  }, [])

  // Load unread notifications count
  useEffect(() => {
    if (token) {
      loadUnreadCount()
      // Poll every 30 seconds for new notifications
      const interval = setInterval(loadUnreadCount, 30000)
      return () => clearInterval(interval)
    }
  }, [token])

  const loadUnreadCount = async () => {
    if (!token) return

    try {
      // Load unread invitations
      const invitationsResponse = await fetch(`${API_URL}/invitations/received`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      let invitationsUnread = 0
      if (invitationsResponse.ok) {
        const invitations = await invitationsResponse.json()
        invitationsUnread = invitations.filter((inv: any) => inv.status === 'pending').length
      }

      // Load unread notifications (assignments, etc.)
      const notificationsResponse = await fetch(`${API_URL}/notifications/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      let notificationsUnread = 0
      if (notificationsResponse.ok) {
        const notifications = await notificationsResponse.json()
        notificationsUnread = notifications.filter((notif: any) => !notif.read).length
      }

      // Set total unread count
      setUnreadCount(invitationsUnread + notificationsUnread)
    } catch (err) {
      console.error('Failed to load unread count:', err)
    }
  }

  const handleLogout = () => {
    authClient.logout()
    localStorage.removeItem('userRole')
    router.push('/auth/login')
  }

  // Menu items based on role
  const getMenuItems = () => {
    const menuItems = [
      { href: '/dashboard', label: '📊 Dashboard', roles: ['admin', 'coach', 'student'] },
      { href: '/dashboard/notifications', label: '🔔 Notifications', roles: ['admin', 'coach', 'student'], badge: unreadCount },
      { href: '/dashboard/exercises', label: '💪 My Exercises', roles: ['admin', 'coach'] },
      { href: '/dashboard/exercises/library', label: '📚 Exercise Library', roles: ['admin', 'coach', 'student'] },
      { href: '/dashboard/groups', label: '👥 Groups', roles: ['admin', 'coach', 'student'] },
      { href: '/dashboard/programs', label: '📋 Programs', roles: ['admin', 'coach'] },
      { href: '/dashboard/my-programs', label: '📋 My Programs', roles: ['student'] },
      { href: '/dashboard/badges', label: '🏆 Badges', roles: ['student'] },
      { href: '/dashboard/stats', label: '📈 Stats', roles: ['student'] },
    ]

    if (!role) return [menuItems[0]] // Only show dashboard if no role
    return menuItems.filter(item => item.roles.includes(role))
  }

  const menu = getMenuItems()

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-blue-600 text-white"
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:relative w-64 h-screen bg-gray-900 text-white transition-transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 flex flex-col h-full">
          <div>
            <h1 className="text-2xl font-bold mb-2">GoBeyondFit</h1>
            {role && (
              <p className="text-xs text-gray-400 mb-6 capitalize">
                Role: <span className="text-blue-400 font-semibold">{role}</span>
              </p>
            )}
          </div>

          <nav className="space-y-2 flex-1">
            {menu.map(item => (
              <div key={item.href} className="relative">
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 rounded-lg hover:bg-gray-800 transition"
                >
                  {item.label}
                </Link>
                {(item as any).badge > 0 && (
                  <span className="absolute top-1 right-2 inline-block px-2 py-1 text-xs font-bold text-white bg-red-600 rounded-full">
                    {(item as any).badge}
                  </span>
                )}
              </div>
            ))}
          </nav>

          <hr className="my-6 border-gray-700" />

          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
        ></div>
      )}
    </>
  )
}
