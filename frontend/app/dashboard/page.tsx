'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth'
import Sidebar from '@/components/sidebar'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated and token is not expired
    if (!authClient.isAuthenticated()) {
      router.push('/auth/login')
      return
    }

    const currentUser = authClient.getUser()
    if (!currentUser) {
      router.push('/auth/login')
      return
    }
    setUser(currentUser)
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-8 md:ml-0">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.firstName || user?.pseudo || 'User'}! 👋</h1>
              <p className="text-gray-600 mt-2">
                Role: <span className="font-semibold capitalize">{user?.role}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {(user?.role === 'coach' || user?.role === 'admin') && (
                <>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-gray-500 text-sm font-medium">Total Exercises</div>
                    <div className="mt-2 flex items-baseline">
                      <span className="text-2xl font-semibold text-gray-900">0</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-gray-500 text-sm font-medium">Active Groups</div>
                    <div className="mt-2 flex items-baseline">
                      <span className="text-2xl font-semibold text-gray-900">0</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-gray-500 text-sm font-medium">Programs</div>
                    <div className="mt-2 flex items-baseline">
                      <span className="text-2xl font-semibold text-gray-900">0</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-gray-500 text-sm font-medium">Workouts</div>
                    <div className="mt-2 flex items-baseline">
                      <span className="text-2xl font-semibold text-gray-900">0</span>
                    </div>
                  </div>
                </>
              )}
              {user?.role === 'student' && (
                <>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-gray-500 text-sm font-medium">My Groups</div>
                    <div className="mt-2 flex items-baseline">
                      <span className="text-2xl font-semibold text-gray-900">0</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-gray-500 text-sm font-medium">Pending Invitations</div>
                    <div className="mt-2 flex items-baseline">
                      <span className="text-2xl font-semibold text-gray-900">0</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-gray-500 text-sm font-medium">Assigned Programs</div>
                    <div className="mt-2 flex items-baseline">
                      <span className="text-2xl font-semibold text-gray-900">0</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-gray-500 text-sm font-medium">Completed Sessions</div>
                    <div className="mt-2 flex items-baseline">
                      <span className="text-2xl font-semibold text-gray-900">0</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Your Profile</h3>
              </div>
              <div className="px-6 py-4">
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Username</dt>
                    <dd className="mt-1 text-sm text-gray-900">{user?.pseudo}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">First Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{user?.firstName || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Last Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{user?.lastName || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Role</dt>
                    <dd className="mt-1 text-sm text-gray-900 capitalize">{user?.role}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">User ID</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-mono">{user?.id}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              {(user?.role === 'coach' || user?.role === 'admin') && (
                <>
                  <h3 className="text-lg font-medium text-blue-900 mb-2">🚀 Start Building</h3>
                  <p className="text-blue-800 mb-4">
                    You're all set! Start by creating your first exercise, group, or program.
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <a
                      href="/dashboard/exercises"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Create Exercise
                    </a>
                    <a
                      href="/dashboard/groups"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Create Group
                    </a>
                    <a
                      href="/dashboard/programs"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Create Program
                    </a>
                  </div>
                </>
              )}
              {user?.role === 'student' && (
                <>
                  <h3 className="text-lg font-medium text-blue-900 mb-2">📚 What's Next?</h3>
                  <p className="text-blue-800 mb-4">
                    Join groups to access exercises and programs assigned by your coach!
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <a
                      href="/dashboard/groups"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Join a Group
                    </a>
                    <a
                      href="/dashboard/notifications"
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      Check Invitations
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
