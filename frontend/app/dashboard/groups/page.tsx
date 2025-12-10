'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/sidebar'
import { GroupInvitationManager } from '@/components/group-invitation-manager'
import { groupClient, type Group, type CreateGroupInput } from '@/lib/api-client'
import { authClient } from '@/lib/auth'

export default function GroupsPage() {
  const router = useRouter()
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)

  const [formData, setFormData] = useState<CreateGroupInput>({
    name: '',
    description: '',
  })

  const currentUser = authClient.getUser()

  useEffect(() => {
    // Check if user is authenticated and token is not expired
    if (!authClient.isAuthenticated()) {
      router.push('/auth/login')
      return
    }
    loadData()
  }, [router])

  const loadData = async () => {
    try {
      setLoading(true)
      const groupsData = await groupClient.getAll()
      setGroups(groupsData)
      setError('')
    } catch (err: any) {
      setError(err.message || 'Failed to load groups')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      if (editingId) {
        await groupClient.update(editingId, formData)
      } else {
        await groupClient.create(formData)
      }

      setFormData({
        name: '',
        description: '',
      })
      setEditingId(null)
      setShowForm(false)
      await loadData()
    } catch (err: any) {
      setError(err.message || 'Failed to save group')
    }
  }

  const handleEdit = (group: Group) => {
    setFormData({
      name: group.name,
      description: group.description || '',
    })
    setEditingId(group.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return

    try {
      await groupClient.delete(id)
      await loadData()
    } catch (err: any) {
      setError(err.message || 'Failed to delete group')
    }
  }

  const handleRemoveMember = async (groupId: string, memberUserId: string) => {
    if (!confirm('Remove this member?')) return

    try {
      await groupClient.removeMember(groupId, memberUserId)
      await loadData()
    } catch (err: any) {
      setError(err.message || 'Failed to remove member')
    }
  }

  const handleLeaveGroup = async (groupId: string, groupName: string) => {
    if (!confirm(`Are you sure you want to leave "${groupName}"?`)) return

    try {
      await groupClient.leaveGroup(groupId)
      await loadData()
      setError('')
    } catch (err: any) {
      setError(err.message || 'Failed to leave group')
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-8 md:ml-0">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">👥 Groups</h1>
              {(currentUser?.role === 'coach' || currentUser?.role === 'admin') && (
                <button
                  onClick={() => {
                    setShowForm(!showForm)
                    setEditingId(null)
                    setFormData({
                      name: '',
                      description: '',
                    })
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {showForm ? 'Cancel' : '➕ New Group'}
                </button>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* Form */}
            {showForm && (currentUser?.role === 'coach' || currentUser?.role === 'admin') && (
              <div className="mb-8 bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">
                  {editingId ? 'Edit Group' : 'Create New Group'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      {editingId ? 'Update' : 'Create'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false)
                        setEditingId(null)
                      }}
                      className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            )}

            {/* Groups List */}
            {!loading && (
              <div className="space-y-4">
                {groups.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No groups found
                  </div>
                ) : (
                  groups.map((group) => (
                    <div key={group.id}>
                      <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1 cursor-pointer" onClick={() => setSelectedGroupId(selectedGroupId === group.id ? null : group.id)}>
                            <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                            {group.description && (
                              <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                            )}
                          </div>
                          {group.ownerId === currentUser?.id && (
                            <span className="px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-800 rounded-full">
                              Owner
                            </span>
                          )}
                        </div>

                        {/* Members */}
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-700 mb-2">Members ({group.members.length})</h4>
                          <div className="flex flex-wrap gap-2">
                            {group.members.map((member) => (
                              <div key={member.id} className="bg-gray-100 rounded-lg px-3 py-2 text-sm flex items-center justify-between">
                                <span className="text-gray-700 mr-2">{member.user.pseudo}</span>
                                {group.ownerId === currentUser?.id && (
                                  <button
                                    onClick={() => handleRemoveMember(group.id, member.userId)}
                                    className="text-red-600 hover:text-red-800 font-semibold"
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        {group.ownerId === currentUser?.id ? (
                          <div className="flex gap-2 pt-4 border-t">
                            <button
                              onClick={() => handleEdit(group)}
                              className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(group.id)}
                              className="flex-1 px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => setSelectedGroupId(selectedGroupId === group.id ? null : group.id)}
                              className="flex-1 px-3 py-2 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 transition"
                            >
                              {selectedGroupId === group.id ? 'Close' : 'Invite'}
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2 pt-4 border-t">
                            <button
                              onClick={() => handleLeaveGroup(group.id, group.name)}
                              className="flex-1 px-3 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition"
                            >
                              Leave Group
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Invitation Manager */}
                      {selectedGroupId === group.id && group.ownerId === currentUser?.id && (
                        <div className="mt-4">
                          <GroupInvitationManager groupId={group.id} />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
