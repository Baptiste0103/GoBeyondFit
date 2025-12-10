import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

/**
 * Get auth token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

/**
 * Make authenticated API request
 */
async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

// ============= Workouts Hooks =============

export function useGetSessions() {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: () => apiRequest('/workouts/my-sessions'),
  });
}

export function useGetSession(sessionId: string) {
  return useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => apiRequest(`/workouts/sessions/${sessionId}`),
    enabled: !!sessionId,
  });
}

export function useSaveExerciseProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      sessionId: string;
      exerciseId: string;
      progress: any;
    }) =>
      apiRequest(`/workouts/sessions/${data.sessionId}/exercises/${data.exerciseId}/progress`, {
        method: 'POST',
        body: JSON.stringify(data.progress),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

export function useCompleteSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) =>
      apiRequest(`/workouts/sessions/${sessionId}/complete`, {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

// ============= Stats Hooks =============

export function useGetStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: () => apiRequest('/stats/my-stats'),
  });
}

export function useGetExerciseStats(exerciseId: string) {
  return useQuery({
    queryKey: ['exercise-stats', exerciseId],
    queryFn: () => apiRequest(`/stats/exercise/${exerciseId}`),
    enabled: !!exerciseId,
  });
}

// ============= Badges Hooks =============

export function useGetBadges() {
  return useQuery({
    queryKey: ['badges'],
    queryFn: () => apiRequest('/badges'),
  });
}

export function useGetUserBadges() {
  return useQuery({
    queryKey: ['user-badges'],
    queryFn: () => apiRequest('/badges/my-badges'),
  });
}

export function useGetBadgeProgress() {
  return useQuery({
    queryKey: ['badge-progress'],
    queryFn: () => apiRequest('/badges/progress'),
  });
}

// ============= Programs Hooks =============

export function useGetPrograms() {
  return useQuery({
    queryKey: ['programs'],
    queryFn: () => apiRequest('/programs'),
  });
}

export function useGetProgram(programId: string) {
  return useQuery({
    queryKey: ['program', programId],
    queryFn: () => apiRequest(`/programs/${programId}`),
    enabled: !!programId,
  });
}

export function useCreateProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) =>
      apiRequest('/programs', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
    },
  });
}

export function useUpdateProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ programId, data }: { programId: string; data: any }) =>
      apiRequest(`/programs/${programId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programs'] });
    },
  });
}

// ============= Exercises Hooks =============

export function useGetExercises() {
  return useQuery({
    queryKey: ['exercises'],
    queryFn: () => apiRequest('/exercises'),
  });
}

export function useGetExercise(exerciseId: string) {
  return useQuery({
    queryKey: ['exercise', exerciseId],
    queryFn: () => apiRequest(`/exercises/${exerciseId}`),
    enabled: !!exerciseId,
  });
}

export function useCreateExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) =>
      apiRequest('/exercises', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    },
  });
}

export function useAddToFavorites() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (exerciseId: string) =>
      apiRequest(`/favorites/${exerciseId}`, {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    },
  });
}

export function useRemoveFromFavorites() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (exerciseId: string) =>
      apiRequest(`/favorites/${exerciseId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    },
  });
}

// ============= Groups Hooks =============

export function useGetGroups() {
  return useQuery({
    queryKey: ['groups'],
    queryFn: () => apiRequest('/groups'),
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) =>
      apiRequest('/groups', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}
