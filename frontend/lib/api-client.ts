import { authClient } from './auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

// Exercise types
export interface Exercise {
  id: string
  name: string
  description?: string
  type: 'standard' | 'EMOM' | 'AMRAP' | 'custom'
  meta?: any
  scope: 'global' | 'coach'
  ownerId?: string
  owner?: {
    id: string
    pseudo: string
    firstName?: string
    lastName?: string
  }
  createdAt: string
  updatedAt: string
}

export interface CreateExerciseInput {
  name: string
  description?: string
  type: 'standard' | 'EMOM' | 'AMRAP' | 'custom'
  meta?: any
  scope: 'global' | 'coach'
}

// Group types
export interface Group {
  id: string
  name: string
  description?: string
  ownerId: string
  owner: {
    id: string
    pseudo: string
    firstName?: string
    lastName?: string
  }
  members: GroupMember[]
  createdAt: string
  updatedAt: string
}

export interface GroupMember {
  id: string
  userId: string
  user: {
    id: string
    pseudo: string
    email: string
    firstName?: string
    lastName?: string
  }
  roleInGroup: string
  joinedAt: string
}

export interface CreateGroupInput {
  name: string
  description?: string
}

export interface Invitation {
  id: string
  groupId: string
  fromCoachId: string
  toUserId: string
  status: 'pending' | 'accepted' | 'rejected'
  group: {
    id: string
    name: string
    description?: string
  }
  fromCoach: {
    id: string
    pseudo: string
    firstName?: string
    lastName?: string
  }
  createdAt: string
  respondedAt?: string
}

// Exercise API calls
export const exerciseClient = {
  async getAll(): Promise<Exercise[]> {
    const token = authClient.getToken()
    const response = await fetch(`${API_URL}/exercises`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch exercises')
    }

    return response.json()
  },

  async getById(id: string): Promise<Exercise> {
    const token = authClient.getToken()
    const response = await fetch(`${API_URL}/exercises/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch exercise')
    }

    return response.json()
  },

  async create(data: CreateExerciseInput): Promise<Exercise> {
    const token = authClient.getToken()
    const response = await fetch(`${API_URL}/exercises`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create exercise')
    }

    return response.json()
  },

  async update(id: string, data: Partial<CreateExerciseInput>): Promise<Exercise> {
    const token = authClient.getToken()
    const response = await fetch(`${API_URL}/exercises/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Failed to update exercise')
    }

    return response.json()
  },

  async delete(id: string): Promise<void> {
    const token = authClient.getToken()
    const response = await fetch(`${API_URL}/exercises/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to delete exercise')
    }
  },
}

// Group API calls
export const groupClient = {
  async getAll(): Promise<Group[]> {
    const token = authClient.getToken()
    const response = await fetch(`${API_URL}/groups`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch groups')
    }

    return response.json()
  },

  async getById(id: string): Promise<Group> {
    const token = authClient.getToken()
    const response = await fetch(`${API_URL}/groups/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch group')
    }

    return response.json()
  },

  async create(data: CreateGroupInput): Promise<Group> {
    const token = authClient.getToken()
    const response = await fetch(`${API_URL}/groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create group')
    }

    return response.json()
  },

  async update(id: string, data: Partial<CreateGroupInput>): Promise<Group> {
    const token = authClient.getToken()
    const response = await fetch(`${API_URL}/groups/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Failed to update group')
    }

    return response.json()
  },

  async delete(id: string): Promise<void> {
    const token = authClient.getToken()
    const response = await fetch(`${API_URL}/groups/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to delete group')
    }
  },

  async inviteUser(groupId: string, toUserId: string): Promise<any> {
    const token = authClient.getToken()
    const response = await fetch(`${API_URL}/groups/${groupId}/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ toUserId }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to invite user')
    }

    return response.json()
  },

  async getInvitations(): Promise<Invitation[]> {
    const token = authClient.getToken()
    const response = await fetch(`${API_URL}/groups/invitations/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch invitations')
    }

    return response.json()
  },

  async respondToInvitation(invitationId: string, status: 'accepted' | 'rejected'): Promise<any> {
    const token = authClient.getToken()
    const response = await fetch(`${API_URL}/groups/invitations/${invitationId}/respond`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    })

    if (!response.ok) {
      throw new Error('Failed to respond to invitation')
    }

    return response.json()
  },

  async removeMember(groupId: string, memberUserId: string): Promise<void> {
    const token = authClient.getToken()
    const response = await fetch(`${API_URL}/groups/${groupId}/members/${memberUserId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to remove member')
    }
  },

  async leaveGroup(groupId: string): Promise<void> {
    const token = authClient.getToken()
    const response = await fetch(`${API_URL}/groups/${groupId}/leave`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to leave group')
    }
  },
}

// Program API calls
export const programClient = {
  async getMyAssignments(): Promise<any[]> {
    const token = authClient.getToken()
    const response = await fetch(`${API_URL}/programs/my-assignments`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch programs')
    }

    return response.json()
  },

  async getProgramDetails(programId: string): Promise<any> {
    const token = authClient.getToken()
    const response = await fetch(`${API_URL}/programs/builder/${programId}/details`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch program details')
    }

    return response.json()
  },

  async assignToStudent(programId: string, studentId: string, groupId?: string): Promise<any> {
    const token = authClient.getToken()
    const body: any = { studentId }
    if (groupId) {
      body.groupId = groupId
    }

    const response = await fetch(`${API_URL}/programs/${programId}/assign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to assign program')
    }

    return response.json()
  },
}

// Session Progress API calls
export const sessionProgressClient = {
  async saveProgress(
    sessionId: string,
    exerciseInstanceId: string,
    data: { progress?: any; notes?: string; videos?: string[] }
  ): Promise<any> {
    const token = authClient.getToken()
    const response = await fetch(
      `${API_URL}/session-progress/sessions/${sessionId}/exercises/${exerciseInstanceId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to save progress')
    }

    return response.json()
  },

  async getSessionProgress(sessionId: string): Promise<any[]> {
    const token = authClient.getToken()
    const response = await fetch(
      `${API_URL}/session-progress/sessions/${sessionId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch session progress')
    }

    return response.json()
  },

  async getProgramProgress(programId: string): Promise<any[]> {
    const token = authClient.getToken()
    const response = await fetch(
      `${API_URL}/session-progress/programs/${programId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch program progress')
    }

    return response.json()
  },

  async getProgressStats(programId: string): Promise<any> {
    const token = authClient.getToken()
    const response = await fetch(
      `${API_URL}/session-progress/programs/${programId}/stats`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch progress stats')
    }

    return response.json()
  },
}

// Workout API calls - for executing workouts from programs
export const workoutClient = {
  async startSession(sessionId: string): Promise<any> {
    const token = authClient.getToken()
    const response = await fetch(`${API_URL}/workouts/start/${sessionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to start session')
    }

    return response.json()
  },

  async getSessionDetails(sessionId: string): Promise<any> {
    const token = authClient.getToken()
    const response = await fetch(`${API_URL}/workouts/sessions/${sessionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to get session details')
    }

    return response.json()
  },

  async completeExercise(
    workoutId: string,
    exerciseIndex: number,
    data: {
      setsCompleted: number
      repsPerSet?: number[]
      weight?: number
      notes?: string
      formRating?: number
    }
  ): Promise<any> {
    const token = authClient.getToken()
    const response = await fetch(
      `${API_URL}/workouts/${workoutId}/exercise/${exerciseIndex}/complete`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to complete exercise')
    }

    return response.json()
  },

  async skipExercise(
    workoutId: string,
    exerciseIndex: number,
    reason?: string
  ): Promise<any> {
    const token = authClient.getToken()
    const response = await fetch(
      `${API_URL}/workouts/${workoutId}/exercise/${exerciseIndex}/skip`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to skip exercise')
    }

    return response.json()
  },

  async endSession(workoutId: string): Promise<any> {
    const token = authClient.getToken()
    const response = await fetch(`${API_URL}/workouts/${workoutId}/end`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to end session')
    }

    return response.json()
  },

  async getWorkoutProgress(workoutId: string): Promise<any> {
    const token = authClient.getToken()
    const response = await fetch(`${API_URL}/workouts/${workoutId}/progress`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to get workout progress')
    }

    return response.json()
  },

  async getCurrentSession(): Promise<any> {
    const token = authClient.getToken()
    const response = await fetch(`${API_URL}/workouts/current`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to get current session')
    }

    return response.json()
  },

  async getHistory(limit: number = 20): Promise<any> {
    const token = authClient.getToken()
    const response = await fetch(`${API_URL}/workouts/history/list?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to get workout history')
    }

    return response.json()
  },

  async getStats(): Promise<any> {
    const token = authClient.getToken()
    const response = await fetch(`${API_URL}/workouts/stats/summary`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to get workout stats')
    }

    return response.json()
  },

  async getSessionStatus(sessionId: string): Promise<any> {
    const token = authClient.getToken()
    const response = await fetch(`${API_URL}/workouts/session/${sessionId}/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to get session status')
    }

    return response.json()
  },
}
