'use client';

import { useState, useEffect } from 'react';
import { Plus, Send, X, CheckCircle, XCircle, Trash2 } from 'lucide-react';
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
}

interface GroupMember {
  id: string;
  userId: string;
  user: User;
}

interface Program {
  id: string;
  title: string;
  description?: string;
  coachId: string;
}

interface ProgramAssignment {
  id: string;
  programId: string;
  studentId: string;
  coachId: string;
  assignedAt: string;
  program?: Program;
  student?: User;
}

interface ProgramAssignmentManagerProps {
  programId?: string;
}

export function ProgramAssignmentManager({ programId }: ProgramAssignmentManagerProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupMembers, setGroupMembers] = useState<User[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [availableStudents, setAvailableStudents] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<ProgramAssignment[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [activeTab, setActiveTab] = useState<'assign' | 'manage'>('assign');

  const token = authClient.getToken();

  // Load user's groups
  useEffect(() => {
    if (token) {
      loadGroups();
    }
  }, [token]);

  const loadGroups = async () => {
    if (!token) return;
    try {
      setLoadingGroups(true);
      const response = await fetch(`${API_URL}/groups`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGroups(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error loading groups:', err);
    } finally {
      setLoadingGroups(false);
    }
  };

  // Load group members when group is selected
  const loadGroupMembers = async (groupId: string) => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/groups/${groupId}/members`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const members = await response.json();
        const memberUsers = members.map((m: GroupMember) => m.user);
        setGroupMembers(memberUsers);
        setSelectedGroup(groupId);
        setSelectedStudents([]);
        setAvailableStudents([]);
        setSearchQuery('');
        setSuccess(null);
      }
    } catch (err) {
      console.error('Error loading group members:', err);
      setError('Failed to load group members');
    } finally {
      setLoading(false);
    }
  };

  // Search students for assignment (filtered by group members if group selected)
  const searchStudents = async (query: string) => {
    if (!query.trim()) {
      setAvailableStudents([]);
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
          const foundStudent = Array.isArray(result.data) ? result.data : [result.data];
          
          // If group is selected, filter to only show group members
          if (selectedGroup && groupMembers.length > 0) {
            const filtered = foundStudent.filter((student: User) =>
              groupMembers.some((member) => member.id === student.id)
            );
            
            if (filtered.length === 0) {
              setError('Student is not a member of the selected group');
              setAvailableStudents([]);
            } else {
              setAvailableStudents(filtered);
              setError(null);
            }
          } else {
            setAvailableStudents(foundStudent);
            setError(null);
          }
        } else {
          setAvailableStudents([]);
          setError('Student not found');
        }
      } else {
        setError('Error searching students');
        setAvailableStudents([]);
      }
    } catch (err) {
      console.error('Error searching students:', err);
      setError('Error searching students');
      setAvailableStudents([]);
    } finally {
      setLoading(false);
    }
  };

  // Load assignments for program
  const loadAssignments = async () => {
    if (!token || !programId) return;

    try {
      setLoadingAssignments(true);
      const response = await fetch(`${API_URL}/programs/${programId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const program = await response.json();
        // This endpoint would need to return assignments
        // For now, we'll just fetch from a different endpoint if available
        setAssignments([]);
      }
    } catch (err) {
      console.error('Error loading assignments:', err);
    } finally {
      setLoadingAssignments(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'manage') {
      loadAssignments();
    }
  }, [activeTab]);

  // Assign program to students
  const handleAssignProgram = async () => {
    if (!programId) {
      setError('Program ID is required');
      return;
    }

    if (!selectedGroup) {
      setError('Please select a group');
      return;
    }

    if (selectedStudents.length === 0) {
      setError('Please select at least one student');
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

      // Assign program to each selected student
      const promises = selectedStudents.map((studentId) =>
        fetch(`${API_URL}/programs/${programId}/assign/${studentId}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            groupId: selectedGroup,
          }),
        })
      );

      const responses = await Promise.all(promises);
      const allSuccess = responses.every((res) => res.ok);

      if (allSuccess) {
        setSuccess(`Program assigned to ${selectedStudents.length} student(s)!`);
        setSelectedStudents([]);
        setAvailableStudents([]);
        setSearchQuery('');
        await loadAssignments();
      } else {
        setError('Failed to assign program to some students');
      }
    } catch (err) {
      console.error('Error assigning program:', err);
      setError('Error assigning program');
    } finally {
      setLoading(false);
    }
  };

  // Remove assignment
  const handleRemoveAssignment = async (assignmentId: string) => {
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/programs/${assignmentId}/assignment`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setAssignments(assignments.filter((a) => a.id !== assignmentId));
        setSuccess('Assignment removed');
      } else {
        setError('Failed to remove assignment');
      }
    } catch (err) {
      console.error('Error removing assignment:', err);
      setError('Error removing assignment');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Program Assignments</h2>
        <p className="text-gray-600">Assign programs to your students</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('assign')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'assign'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Assign Program
        </button>
        <button
          onClick={() => setActiveTab('manage')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'manage'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Manage Assignments
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

      {/* Assign Tab */}
      {activeTab === 'assign' && (
        <div className="space-y-4">
          {/* Group Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Select Group (Optional)
            </label>
            <select
              value={selectedGroup || ''}
              onChange={(e) => {
                if (e.target.value) {
                  loadGroupMembers(e.target.value);
                } else {
                  setSelectedGroup(null);
                  setGroupMembers([]);
                  setSelectedStudents([]);
                  setAvailableStudents([]);
                  setSearchQuery('');
                }
              }}
              disabled={loadingGroups}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">-- Select a group to filter students --</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
            {selectedGroup && groupMembers.length > 0 && (
              <p className="mt-2 text-sm text-gray-600">
                Showing {groupMembers.length} members from selected group
              </p>
            )}
          </div>

          {/* Student Search */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Search Students by Pseudo
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter student pseudo"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  searchStudents(e.target.value);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {selectedGroup && (
              <p className="mt-1 text-xs text-gray-500">
                ℹ️ Only members of the selected group will be shown
              </p>
            )}
          </div>

          {/* Available Students */}
          {availableStudents.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Found Students</h3>
              <div className="space-y-2">
                {availableStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-200"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{student.pseudo}</div>
                      <div className="text-sm text-gray-600">{student.email}</div>
                    </div>
                    <button
                      onClick={() => {
                        if (selectedStudents.includes(student.id)) {
                          setSelectedStudents(selectedStudents.filter((id) => id !== student.id));
                        } else {
                          setSelectedStudents([...selectedStudents, student.id]);
                        }
                      }}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        selectedStudents.includes(student.id)
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-blue-600 text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      {selectedStudents.includes(student.id) ? '✓ Selected' : 'Select'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selected Students */}
          {selectedStudents.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                Selected Students ({selectedStudents.length})
              </h3>
              <div className="space-y-2">
                {selectedStudents.map((studentId) => {
                  const student = availableStudents.find((s) => s.id === studentId);
                  return (
                    <div
                      key={studentId}
                      className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-300"
                    >
                      <div>
                        <div className="font-medium text-gray-900">{student?.pseudo}</div>
                      </div>
                      <button
                        onClick={() =>
                          setSelectedStudents(selectedStudents.filter((id) => id !== studentId))
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

          {/* Assign Button */}
          <button
            onClick={handleAssignProgram}
            disabled={loading || selectedStudents.length === 0}
            className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 transition"
          >
            <Plus size={18} />
            {loading ? 'Assigning...' : `Assign to ${selectedStudents.length} Student(s)`}
          </button>
        </div>
      )}

      {/* Manage Assignments Tab */}
      {activeTab === 'manage' && (
        <div className="space-y-4">
          {loadingAssignments ? (
            <div className="flex justify-center items-center py-8">
              <div className="h-10 w-10 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No assignments yet</div>
          ) : (
            <div className="space-y-3">
              {assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      {assignment.student?.pseudo}
                    </div>
                    <div className="text-sm text-gray-600">{assignment.student?.email}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Assigned: {new Date(assignment.assignedAt).toLocaleDateString()}
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveAssignment(assignment.id)}
                    className="text-red-600 hover:text-red-700 transition"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
