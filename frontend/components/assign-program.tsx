'use client';

import { useState } from 'react';
import { Users, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { authClient } from '@/lib/auth';

interface AssignProgramProps {
  programId: string;
  programTitle: string;
  onAssigned?: () => void;
}

export function AssignProgram({ programId, programTitle, onAssigned }: AssignProgramProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
  const token = authClient.getToken();

  const [studentEmail, setStudentEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleAssignProgram = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentEmail.trim()) {
      setMessage({ type: 'error', text: 'Student email is required' });
      return;
    }

    setLoading(true);
    try {
      // First, search for the student by email
      const userResponse = await fetch(`${API_URL}/search/users?email=${encodeURIComponent(studentEmail)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error('Student not found');
      }

      const student = await userResponse.json();

      // Assign the program to the student
      const assignResponse = await fetch(`${API_URL}/programs/${programId}/assign/${student.id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (assignResponse.ok) {
        setMessage({
          type: 'success',
          text: `Program assigned to ${student.pseudo}!`,
        });
        setStudentEmail('');
        setTimeout(() => {
          setMessage(null);
          onAssigned?.();
        }, 2000);
      } else {
        const error = await assignResponse.json();
        throw new Error(error.message || 'Failed to assign program');
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to assign program',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Users size={20} />
        Assign to Student: "{programTitle}"
      </h3>

      <form onSubmit={handleAssignProgram} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Student Email</label>
          <div className="flex gap-2">
            <input
              type="email"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              placeholder="student@example.com"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !studentEmail.trim()}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg flex items-center gap-2 transition"
            >
              <Send size={16} />
              {loading ? 'Assigning...' : 'Assign'}
            </button>
          </div>
        </div>

        {message && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
            }`}
          >
            {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
}
