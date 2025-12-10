'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Plus, Trash2, Save, AlertCircle, LogOut, Copy, Clipboard, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth';

interface Session {
  id: string;
  title: string;
  exercises: Array<{
    id: string;
    exerciseId: string;
    name: string;
    description?: string;
    config?: ExerciseConfig;
  }>;
}

interface Week {
  id: string;
  weekNumber: number;
  sessions: Session[];
}

interface Block {
  id: string;
  title: string;
  weeks: Week[];
}

interface ProgramBuilderProps {
  initialProgramId?: string;
}

interface ExerciseConfig {
  sets?: number;
  reps?: number;
  format?: string;
  weight?: number;
  duration?: number;
  notes?: string;
}

export function ProgramBuilderV2({ initialProgramId }: ProgramBuilderProps) {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

  const [programId, setProgramId] = useState<string | undefined>(initialProgramId);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [availableExercises, setAvailableExercises] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Clipboard states - now only for manual button click
  const [clipboardSession, setClipboardSession] = useState<Session | null>(null);
  const [clipboardBlock, setClipboardBlock] = useState<Block | null>(null);
  const [availablePrograms, setAvailablePrograms] = useState<any[]>([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showProgramDropdown, setShowProgramDropdown] = useState(false);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [editingWeekId, setEditingWeekId] = useState<string | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingBlockTitle, setEditingBlockTitle] = useState('');
  const [editingWeekNumber, setEditingWeekNumber] = useState(0);
  const [editingSessionTitle, setEditingSessionTitle] = useState('');
  const clipboardRef = useRef<HTMLDivElement>(null);

  // Exercise library search state
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState('');
  const [exerciseMuscleFilter, setExerciseMuscleFilter] = useState('');
  const [exerciseDifficultyFilter, setExerciseDifficultyFilter] = useState('');
  const [exerciseLoading, setExerciseLoading] = useState(false);
  const [exerciseError, setExerciseError] = useState<string | null>(null);
  const [exercisePagination, setExercisePagination] = useState<{
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  } | null>(null);
  const [exerciseSearchExecuted, setExerciseSearchExecuted] = useState(false);

  // Exercise configuration state
  const [pendingExercise, setPendingExercise] = useState<any>(null);
  const [pendingSessionInfo, setPendingSessionInfo] = useState<{ blockId: string; weekId: string; sessionId: string } | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [exerciseConfig, setExerciseConfig] = useState<ExerciseConfig>({
    sets: 3,
    reps: 10,
    format: 'standard',
  });

  const token = authClient.getToken();

  // Load program if initialProgramId provided
  useEffect(() => {
    if (initialProgramId) {
      loadProgram(initialProgramId);
    }
  }, [initialProgramId]);

  const loadProgram = async (pid: string) => {
    try {
      const response = await fetch(`${API_URL}/programs/builder/${pid}/details`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTitle(data.title);
        setDescription(data.description);
        setBlocks(data.blocks || []);
        setProgramId(pid);
      }
    } catch (error) {
      console.error('Error loading program:', error);
    }
  };

  const exerciseEndpointBase = `${API_URL}/exercises/library/search`;

  const searchLibraryExercises = useCallback(async (page: number = 1) => {
    if (!token) {
      setExerciseError('Session expired. Please log in again.');
      return;
    }

    if (!exerciseSearchQuery.trim() && !exerciseMuscleFilter && !exerciseDifficultyFilter) {
      setExerciseError('Veuillez saisir un terme de recherche ou un filtre.');
      setAvailableExercises([]);
      setExercisePagination(null);
      return;
    }

    try {
      setExerciseLoading(true);
      setExerciseError(null);
      setExerciseSearchExecuted(true);

      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '12');

      if (exerciseSearchQuery.trim()) params.append('q', exerciseSearchQuery.trim());
      if (exerciseMuscleFilter) params.append('muscle', exerciseMuscleFilter);
      if (exerciseDifficultyFilter) params.append('difficulty', exerciseDifficultyFilter);

      const response = await fetch(`${exerciseEndpointBase}?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Impossible de récupérer les exercices.');
      }

      const data = await response.json();
      setAvailableExercises(data.data || []);
      setExercisePagination(data.pagination || null);
    } catch (error) {
      console.error('Exercise search failed:', error);
      setExerciseError(error instanceof Error ? error.message : 'Erreur lors de la recherche.');
      setAvailableExercises([]);
      setExercisePagination(null);
    } finally {
      setExerciseLoading(false);
    }
  }, [token, exerciseEndpointBase, exerciseSearchQuery, exerciseMuscleFilter, exerciseDifficultyFilter]);

  const handleExerciseSearch = useCallback((e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    searchLibraryExercises(1);
  }, [searchLibraryExercises]);

  const handleExercisePageChange = useCallback((direction: 'prev' | 'next') => {
    if (!exercisePagination) return;

    const nextPage = direction === 'prev'
      ? exercisePagination.page - 1
      : exercisePagination.page + 1;

    if (nextPage < 1 || (exercisePagination.totalPages && nextPage > exercisePagination.totalPages)) {
      return;
    }

    searchLibraryExercises(nextPage);
  }, [exercisePagination, searchLibraryExercises]);

  const clearExerciseSearch = useCallback(() => {
    setExerciseSearchQuery('');
    setExerciseMuscleFilter('');
    setExerciseDifficultyFilter('');
    setAvailableExercises([]);
    setExercisePagination(null);
    setExerciseError(null);
    setExerciseSearchExecuted(false);
  }, []);

  useEffect(() => {
    if (!selectedSessionId) {
      clearExerciseSearch();
    }
  }, [selectedSessionId, clearExerciseSearch]);

  // Add new block
  const addBlock = useCallback(() => {
    const newBlock: Block = {
      id: `block-${Date.now()}`,
      title: `Block ${blocks.length + 1}`,
      weeks: [
        {
          id: `week-${Date.now()}`,
          weekNumber: 1,
          sessions: [
            {
              id: `session-${Date.now()}`,
              title: 'Session 1',
              exercises: [],
            },
          ],
        },
      ],
    };
    setBlocks([...blocks, newBlock]);
  }, [blocks]);

  // Remove block
  const removeBlock = useCallback((blockId: string) => {
    setBlocks(blocks.filter((b) => b.id !== blockId));
  }, [blocks]);

  // Add week to block
  const addWeek = useCallback((blockId: string) => {
    setBlocks(
      blocks.map((b) => {
        if (b.id === blockId) {
          const newWeek: Week = {
            id: `week-${Date.now()}`,
            weekNumber: (b.weeks[b.weeks.length - 1]?.weekNumber || 0) + 1,
            sessions: [],
          };
          return { ...b, weeks: [...b.weeks, newWeek] };
        }
        return b;
      })
    );
  }, [blocks]);

  // Add session to week
  const addSession = useCallback((blockId: string, weekId: string) => {
    setBlocks(
      blocks.map((b) => {
        if (b.id === blockId) {
          return {
            ...b,
            weeks: b.weeks.map((w) => {
              if (w.id === weekId) {
                const newSession: Session = {
                  id: `session-${Date.now()}`,
                  title: `Session ${w.sessions.length + 1}`,
                  exercises: [],
                };
                return { ...w, sessions: [...w.sessions, newSession] };
              }
              return w;
            }),
          };
        }
        return b;
      })
    );
  }, [blocks]);

  // Add exercise to session (opens config modal)
  const addExerciseToSession = useCallback(
    (blockId: string, weekId: string, sessionId: string, exercise: any) => {
      // Store the pending exercise and session info
      setPendingExercise(exercise);
      setPendingSessionInfo({ blockId, weekId, sessionId });
      
      // Reset config to defaults
      setExerciseConfig({
        sets: 3,
        reps: 10,
        format: 'standard',
      });
      
      // Show config modal
      setShowConfigModal(true);
    },
    []
  );

  // Confirm exercise with configuration
  const confirmExerciseWithConfig = useCallback(() => {
    if (!pendingExercise || !pendingSessionInfo) return;
    
    const { blockId, weekId, sessionId } = pendingSessionInfo;
    
    // Make sure we have the exerciseId
    const exerciseId = pendingExercise.id || pendingExercise.exerciseId;
    if (!exerciseId) {
      console.error('No exerciseId in pending exercise:', pendingExercise);
      return;
    }
    
    setBlocks(
      blocks.map((b) => {
        if (b.id === blockId) {
          return {
            ...b,
            weeks: b.weeks.map((w) => {
              if (w.id === weekId) {
                return {
                  ...w,
                  sessions: w.sessions.map((s) => {
                    if (s.id === sessionId) {
                      return {
                        ...s,
                        exercises: [...s.exercises, { 
                          id: `ex-${Date.now()}`,
                          exerciseId: exerciseId,  // Use real exercise ID
                          name: pendingExercise.name,
                          description: pendingExercise.description,
                          config: exerciseConfig
                        }],
                      };
                    }
                    return s;
                  }),
                };
              }
              return w;
            }),
          };
        }
        return b;
      })
    );
    
    // Close modal and reset
    setShowConfigModal(false);
    setPendingExercise(null);
    setPendingSessionInfo(null);
    setSelectedSessionId(null);
  }, [blocks, pendingExercise, pendingSessionInfo, exerciseConfig]);

  // Remove exercise from session
  const removeExercise = useCallback(
    (blockId: string, weekId: string, sessionId: string, exerciseId: string) => {
      setBlocks(
        blocks.map((b) => {
          if (b.id === blockId) {
            return {
              ...b,
              weeks: b.weeks.map((w) => {
                if (w.id === weekId) {
                  return {
                    ...w,
                    sessions: w.sessions.map((s) => {
                      if (s.id === sessionId) {
                        return {
                          ...s,
                          exercises: s.exercises.filter((e) => e.id !== exerciseId),
                        };
                      }
                      return s;
                    }),
                  };
                }
                return w;
              }),
            };
          }
          return b;
        })
      );
    },
    [blocks]
  );

  // Copy session
  const copySession = useCallback((session: Session) => {
    setClipboardSession({ ...session, id: `session-${Date.now()}` });
    // Visual feedback
    alert('✅ Séance copiée!');
  }, []);

  // Paste session exercises into existing sessions in a week
  const pasteSession = useCallback((blockId: string, weekId: string) => {
    if (!clipboardSession) {
      alert('⚠️ Aucune séance à coller. Copiez une séance d\'abord.');
      return;
    }

    setBlocks(
      blocks.map((b) => {
        if (b.id === blockId) {
          return {
            ...b,
            weeks: b.weeks.map((w) => {
              if (w.id === weekId) {
                // If no sessions exist, create one with the pasted exercises
                if (w.sessions.length === 0) {
                  const newSession = {
                    ...clipboardSession,
                    id: `session-${Date.now()}`,
                    exercises: JSON.parse(JSON.stringify(clipboardSession.exercises)),
                  };
                  return { ...w, sessions: [newSession] };
                }
                
                // Inject exercises into all existing sessions
                return {
                  ...w,
                  sessions: w.sessions.map((s) => ({
                    ...s,
                    exercises: [
                      ...s.exercises,
                      ...JSON.parse(JSON.stringify(clipboardSession.exercises)).map((ex: any) => ({
                        ...ex,
                        id: `ex-${Date.now()}-${Math.random()}`,
                      })),
                    ],
                  })),
                };
              }
              return w;
            }),
          };
        }
        return b;
      })
    );
    
    // Clear clipboard after paste
    setClipboardSession(null);
    alert('✅ Exercices collés dans les séances existantes!');
  }, [blocks, clipboardSession]);

  // Remove session from week
  const removeSession = useCallback(
    (blockId: string, weekId: string, sessionId: string) => {
      setBlocks(
        blocks.map((b) => {
          if (b.id === blockId) {
            return {
              ...b,
              weeks: b.weeks.map((w) => {
                if (w.id === weekId) {
                  return {
                    ...w,
                    sessions: w.sessions.filter((s) => s.id !== sessionId),
                  };
                }
                return w;
              }),
            };
          }
          return b;
        })
      );
    },
    [blocks]
  );

  // Remove week from block
  const removeWeek = useCallback(
    (blockId: string, weekId: string) => {
      setBlocks(
        blocks.map((b) => {
          if (b.id === blockId) {
            return {
              ...b,
              weeks: b.weeks.filter((w) => w.id !== weekId),
            };
          }
          return b;
        })
      );
    },
    [blocks]
  );

  // Edit block title
  const editBlockTitle = useCallback(
    (blockId: string, newTitle: string) => {
      if (!newTitle.trim()) return;
      
      setBlocks(
        blocks.map((b) => {
          if (b.id === blockId) {
            return { ...b, title: newTitle.trim() };
          }
          return b;
        })
      );
      setEditingBlockId(null);
    },
    [blocks]
  );

  // Edit week number
  const editWeekNumber = useCallback(
    (blockId: string, weekId: string, newWeekNumber: number) => {
      if (newWeekNumber < 1) return;
      
      setBlocks(
        blocks.map((b) => {
          if (b.id === blockId) {
            return {
              ...b,
              weeks: b.weeks.map((w) => {
                if (w.id === weekId) {
                  return { ...w, weekNumber: newWeekNumber };
                }
                return w;
              }),
            };
          }
          return b;
        })
      );
      setEditingWeekId(null);
    },
    [blocks]
  );

  // Edit session title
  const editSessionTitle = useCallback(
    (blockId: string, weekId: string, sessionId: string, newTitle: string) => {
      if (!newTitle.trim()) return;
      
      setBlocks(
        blocks.map((b) => {
          if (b.id === blockId) {
            return {
              ...b,
              weeks: b.weeks.map((w) => {
                if (w.id === weekId) {
                  return {
                    ...w,
                    sessions: w.sessions.map((s) => {
                      if (s.id === sessionId) {
                        return { ...s, title: newTitle.trim() };
                      }
                      return s;
                    }),
                  };
                }
                return w;
              }),
            };
          }
          return b;
        })
      );
      setEditingSessionId(null);
    },
    [blocks]
  );

  // Load and use existing program
  const loadAndUseProgram = useCallback(
    async (programIdToLoad: string) => {
      try {
        const response = await fetch(`${API_URL}/programs/builder/${programIdToLoad}/details`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          // Deep copy the program structure with new IDs
          const deepCopyBlocks = JSON.parse(JSON.stringify(data.blocks));
          const newBlocks = deepCopyBlocks.map((block: any) => ({
            ...block,
            id: `block-${Date.now()}-${Math.random()}`,
            weeks: block.weeks.map((week: any) => ({
              ...week,
              id: `week-${Date.now()}-${Math.random()}`,
              sessions: week.sessions.map((session: any) => ({
                ...session,
                id: `session-${Date.now()}-${Math.random()}`,
              })),
            })),
          }));
          setBlocks(newBlocks);
          setTitle(`${data.title} (Copy)`);
          setShowProgramDropdown(false);
        }
      } catch (error) {
        console.error('Error loading program:', error);
        alert('❌ Erreur lors du chargement du programme');
      }
    },
    [token, API_URL]
  );

  // Copy block
  const copyBlock = useCallback((block: Block) => {
    setClipboardBlock({ ...block, id: `block-${Date.now()}` });
    alert('✅ Bloc copié!');
  }, []);

  // Paste block
  const pasteBlock = useCallback(() => {
    if (!clipboardBlock) {
      alert('⚠️ Aucun bloc à coller. Copiez un bloc d\'abord.');
      return;
    }

    const newBlock = {
      ...clipboardBlock,
      id: `block-${Date.now()}`,
      title: `${clipboardBlock.title} (copie)`,
      weeks: JSON.parse(JSON.stringify(clipboardBlock.weeks)), // Deep copy weeks
    };
    setBlocks([...blocks, newBlock]);
    
    // Clear clipboard after paste
    setClipboardBlock(null);
  }, [blocks, clipboardBlock]);

  // Load available programs for dropdown
  const loadAvailablePrograms = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/programs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        // Sort programs by newest first
        const sortedPrograms = (data.data || []).sort((a: any, b: any) => {
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        });
        setAvailablePrograms(sortedPrograms);
      }
    } catch (error) {
      console.error('Error loading programs:', error);
    }
  }, [token, API_URL]);

  // Use existing program as template
  const useTemplateProgram = useCallback(
    async (templateProgramId: string) => {
      try {
        const response = await fetch(`${API_URL}/programs/builder/${templateProgramId}/details`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          // Deep copy the program structure
          const deepCopyBlocks = JSON.parse(JSON.stringify(data.blocks));
          // Regenerate IDs
          const newBlocks = deepCopyBlocks.map((block: any) => ({
            ...block,
            id: `block-${Date.now()}-${Math.random()}`,
            weeks: block.weeks.map((week: any) => ({
              ...week,
              id: `week-${Date.now()}-${Math.random()}`,
              sessions: week.sessions.map((session: any) => ({
                ...session,
                id: `session-${Date.now()}-${Math.random()}`,
              })),
            })),
          }));
          setBlocks(newBlocks);
          setTitle(`${data.title} (from template)`);
          setShowTemplateModal(false);
        }
      } catch (error) {
        console.error('Error loading template:', error);
        alert('❌ Erreur lors du chargement du template');
      }
    },
    [token, API_URL]
  );

  // Save program
  const saveProgram = async () => {
    if (!title.trim()) {
      setValidationErrors(['Program title is required']);
      return;
    }

    setIsSaving(true);
    try {
      // Create program if it doesn't exist yet
      let pid = programId;
      if (!pid) {
        console.log('Creating new program:', { title, description });
        const createResponse = await fetch(`${API_URL}/programs`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title,
            description,
            isDraft: true,
          }),
        });
        console.log('Create response:', { status: createResponse.status, ok: createResponse.ok });
        
        if (createResponse.ok) {
          const newProgram = await createResponse.json();
          console.log('Created program:', newProgram);
          pid = newProgram.id;
          setProgramId(pid);
        } else {
          const errorText = await createResponse.text();
          console.error('Create error:', errorText);
          throw new Error(`Failed to create program: ${createResponse.status} - ${errorText}`);
        }
      }

      // Save the structure
      const savePayload = {
        title,
        description,
        blocks,
        isDraft: true,
      };
      console.log('Saving program:', { programId: pid, payload: savePayload });
      
      const response = await fetch(`${API_URL}/programs/builder/${pid}/save`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(savePayload),
      });

      console.log('Save response:', { status: response.status, ok: response.ok });
      
      if (response.ok) {
        setValidationErrors([]);
        alert('Program saved successfully!');
      } else {
        const errorText = await response.text();
        console.error('Save error response:', errorText);
        setValidationErrors([`Error saving program: ${response.status} - ${errorText}`]);
      }
    } catch (error) {
      console.error('Error saving program:', error);
      setValidationErrors(['Error saving program']);
    } finally {
      setIsSaving(false);
    }
  };

  // Save and quit
  const saveAndQuit = async () => {
    await saveProgram();
    if (validationErrors.length === 0) {
      router.push('/dashboard/programs');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex gap-2 mb-4 flex-wrap">
          {/* Use Template Dropdown - Repurposed from Load Program */}
          <div className="relative">
            <button
              onClick={() => {
                if (!showProgramDropdown) {
                  loadAvailablePrograms();
                }
                setShowProgramDropdown(!showProgramDropdown);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition flex items-center gap-2"
            >
              <ChevronDown size={18} /> Use Template
            </button>
            
            {showProgramDropdown && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white border-2 border-green-300 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                {availablePrograms.length > 0 ? (
                  <div className="p-2 space-y-1">
                    {availablePrograms.map((program: any) => (
                      <button
                        key={program.id}
                        onClick={() => {
                          loadAndUseProgram(program.id);
                          setShowProgramDropdown(false);
                        }}
                        className="w-full text-left p-3 hover:bg-green-100 rounded transition truncate text-sm font-medium text-gray-900"
                        title={program.title}
                      >
                        {program.title}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 text-sm text-gray-600 text-center">
                    No programs available
                  </div>
                )}
              </div>
            )}
          </div>
          {clipboardBlock && (
            <button
              onClick={pasteBlock}
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition flex items-center gap-2"
            >
              <Clipboard size={18} /> Paste Block
            </button>
          )}
        </div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Program Title"
          className="w-full text-3xl font-bold mb-2 p-2 border border-gray-300 rounded"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Program Description (optional)"
          className="w-full p-2 border border-gray-300 rounded text-gray-600"
          rows={2}
        />
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded flex gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
          <div className="text-red-600">
            {validationErrors.map((error, i) => (
              <p key={i}>{error}</p>
            ))}
          </div>
        </div>
      )}

      {/* Program Structure */}
      <div className="space-y-6 mb-8">
        {blocks.map((block) => (
          <div key={block.id} className="border-2 border-blue-300 rounded-lg p-6 bg-blue-50" data-clipboard-block={block.id}>
            <div className="flex justify-between items-center mb-4">
              {editingBlockId === block.id ? (
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={editingBlockTitle}
                    onChange={(e) => setEditingBlockTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        editBlockTitle(block.id, editingBlockTitle);
                      }
                    }}
                    onBlur={() => editBlockTitle(block.id, editingBlockTitle)}
                    autoFocus
                    className="flex-1 text-2xl font-bold p-2 border border-blue-500 rounded"
                  />
                </div>
              ) : (
                <h2 className="text-2xl font-bold text-blue-900 cursor-pointer hover:text-blue-700" onClick={() => {
                  setEditingBlockId(block.id);
                  setEditingBlockTitle(block.title);
                }}>
                  {block.title}
                </h2>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => copyBlock(block)}
                  className="p-2 bg-blue-500 text-white hover:bg-blue-600 rounded transition flex items-center gap-1 text-sm"
                >
                  <Copy size={16} /> Copy
                </button>
                <button
                  onClick={() => removeBlock(block.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                  title="Delete block"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>

            {/* Weeks */}
            <div className="space-y-4">
              {block.weeks.map((week) => (
                <div key={week.id} className="border border-blue-200 rounded-lg p-4 bg-white">
                  <div className="flex justify-between items-center mb-3">
                    {editingWeekId === week.id ? (
                      <div className="flex gap-2 items-center">
                        <span>Week</span>
                        <input
                          type="number"
                          min="1"
                          value={editingWeekNumber}
                          onChange={(e) => setEditingWeekNumber(parseInt(e.target.value) || 1)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              editWeekNumber(block.id, week.id, editingWeekNumber);
                            }
                          }}
                          onBlur={() => editWeekNumber(block.id, week.id, editingWeekNumber)}
                          autoFocus
                          className="w-16 p-2 border border-blue-500 rounded"
                        />
                      </div>
                    ) : (
                      <h3 className="font-semibold text-lg cursor-pointer hover:text-blue-600" onClick={() => {
                        setEditingWeekId(week.id);
                        setEditingWeekNumber(week.weekNumber);
                      }}>
                        Week {week.weekNumber}
                      </h3>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => addSession(block.id, week.id)}
                        className="p-1 px-3 text-blue-600 hover:bg-blue-50 rounded transition flex items-center gap-1 text-sm"
                      >
                        <Plus size={16} /> Add Session
                      </button>
                      <button
                        onClick={() => removeWeek(block.id, week.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                        title="Delete week"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Sessions */}
                  <div className="space-y-3">
                    {week.sessions.map((session) => (
                      <div key={session.id} className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded" data-clipboard-session={session.id}>
                        <div className="flex justify-between items-center mb-2">
                          {editingSessionId === session.id ? (
                            <input
                              type="text"
                              value={editingSessionTitle}
                              onChange={(e) => setEditingSessionTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  editSessionTitle(block.id, week.id, session.id, editingSessionTitle);
                                }
                              }}
                              onBlur={() => editSessionTitle(block.id, week.id, session.id, editingSessionTitle)}
                              autoFocus
                              className="flex-1 p-2 border border-blue-500 rounded font-medium"
                            />
                          ) : (
                            <span className="font-medium cursor-pointer hover:text-blue-600" onClick={() => {
                              setEditingSessionId(session.id);
                              setEditingSessionTitle(session.title);
                            }}>
                              {session.title}
                            </span>
                          )}
                          <div className="flex gap-2">
                            <button
                              onClick={() => copySession(session)}
                              className="p-1 px-2 bg-blue-500 text-white hover:bg-blue-600 rounded transition flex items-center gap-1 text-xs"
                            >
                              <Copy size={14} /> Copy
                            </button>
                            {clipboardSession && (
                              <button
                                onClick={() => pasteSession(block.id, week.id)}
                                className="p-1 px-2 bg-orange-500 text-white hover:bg-orange-600 rounded transition flex items-center gap-1 text-xs"
                              >
                                <Clipboard size={14} /> Paste
                              </button>
                            )}
                            <button
                              onClick={() =>
                                setSelectedSessionId(
                                  selectedSessionId === session.id ? null : session.id
                                )
                              }
                              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm transition"
                            >
                              {selectedSessionId === session.id ? 'Hide' : 'Add'}
                            </button>
                            <button
                              onClick={() => removeSession(block.id, week.id, session.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                              title="Delete session"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Exercises List */}
                        <div className="mb-2 bg-white p-2 rounded">
                          {session.exercises.length > 0 ? (
                            <ul className="space-y-1">
                              {session.exercises.map((ex: any) => (
                                <li
                                  key={ex.id}
                                  className="flex justify-between items-center text-sm bg-gray-100 p-2 rounded"
                                >
                                  <div className="flex-1">
                                    <div className="font-medium">{ex.name}</div>
                                    {ex.config && (
                                      <div className="text-xs text-gray-600 mt-1">
                                        {ex.config.sets && `${ex.config.sets} sets`}
                                        {ex.config.reps && ` × ${ex.config.reps} reps`}
                                        {ex.config.format && ` | ${ex.config.format}`}
                                        {ex.config.weight && ` | ${ex.config.weight}kg`}
                                      </div>
                                    )}
                                  </div>
                                  <button
                                    onClick={() =>
                                      removeExercise(block.id, week.id, session.id, ex.id)
                                    }
                                    className="text-red-500 hover:text-red-700 font-bold"
                                  >
                                    ×
                                  </button>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-gray-500 text-sm italic py-2">No exercises added</p>
                          )}
                        </div>

                        {/* Add Exercise Panel */}
                        {selectedSessionId === session.id && (
                          <div className="mt-3 p-5 bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-100 rounded-xl border-2 border-blue-300 shadow-inner">
                            <form onSubmit={handleExerciseSearch} className="space-y-3">
                              <div className="grid gap-3 md:grid-cols-3">
                                <div className="md:col-span-3 lg:col-span-2">
                                  <label className="block text-sm font-semibold text-blue-900 mb-2">
                                    🔍 Recherche d'exercice
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Ex: squat, développé couché, tirage, cardio..."
                                    value={exerciseSearchQuery}
                                    onChange={(e) => setExerciseSearchQuery(e.target.value)}
                                    className="w-full p-3 border-2 border-blue-300 rounded-lg font-medium text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-semibold text-blue-900 mb-2">
                                    💪 Groupe musculaire
                                  </label>
                                  <select
                                    value={exerciseMuscleFilter}
                                    onChange={(e) => setExerciseMuscleFilter(e.target.value)}
                                    className="w-full p-3 border-2 border-blue-300 rounded-lg text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                  >
                                    <option value="">Tous</option>
                                    <option value="Chest">Pectoraux</option>
                                    <option value="Back">Dos</option>
                                    <option value="Legs">Jambes</option>
                                    <option value="Shoulders">Épaules</option>
                                    <option value="Arms">Bras</option>
                                    <option value="Core">Gainage / Core</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-semibold text-blue-900 mb-2">
                                    🎯 Difficulté
                                  </label>
                                  <select
                                    value={exerciseDifficultyFilter}
                                    onChange={(e) => setExerciseDifficultyFilter(e.target.value)}
                                    className="w-full p-3 border-2 border-blue-300 rounded-lg text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                  >
                                    <option value="">Toutes</option>
                                    <option value="Beginner">Débutant</option>
                                    <option value="Intermediate">Intermédiaire</option>
                                    <option value="Advanced">Avancé</option>
                                  </select>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="submit"
                                  disabled={exerciseLoading}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60"
                                >
                                  {exerciseLoading ? 'Recherche en cours...' : 'Rechercher'}
                                </button>
                                <button
                                  type="button"
                                  onClick={clearExerciseSearch}
                                  className="px-4 py-2 bg-white text-blue-700 border-2 border-blue-400 rounded-lg font-semibold hover:bg-blue-100 transition"
                                >
                                  Réinitialiser
                                </button>
                              </div>
                            </form>

                            {exerciseError && (
                              <div className="mt-3 bg-red-100 border border-red-300 text-red-700 text-sm px-3 py-2 rounded-lg">
                                {exerciseError}
                              </div>
                            )}

                            <div className="mt-4">
                              {!exerciseSearchExecuted && !exerciseLoading ? (
                                <div className="p-6 text-center border border-dashed border-blue-300 bg-white/70 rounded-lg text-sm text-blue-800 font-medium">
                                  Tapez un mot-clé ou appliquez un filtre puis cliquez sur « Rechercher » pour explorer la librairie d'exercices.
                                </div>
                              ) : exerciseLoading ? (
                                <div className="flex justify-center items-center py-8">
                                  <div className="h-10 w-10 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin" aria-label="Chargement des exercices"></div>
                                </div>
                              ) : availableExercises.length === 0 ? (
                                <div className="p-6 text-center bg-white rounded-lg border border-blue-200 text-sm text-blue-800 font-medium">
                                  Aucun exercice ne correspond à votre recherche. Essayez un autre mot-clé ou ajustez les filtres.
                                </div>
                              ) : (
                                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                                  {availableExercises.map((ex: any) => (
                                    <div
                                      key={ex.id}
                                      className="p-4 bg-white border-l-4 border-blue-500 rounded-lg shadow-sm hover:shadow-md transition"
                                    >
                                      <div className="flex justify-between items-start gap-3">
                                        <div className="flex-1 min-w-0">
                                          <h4 className="font-semibold text-sm text-gray-900 truncate">
                                            {ex.name}
                                          </h4>
                                          {ex.description && (
                                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                              {ex.description}
                                            </p>
                                          )}
                                          <div className="flex flex-wrap gap-1 mt-2">
                                            {ex.meta?.targetMuscleGroup && (
                                              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-700">
                                                💪 {ex.meta.targetMuscleGroup}
                                              </span>
                                            )}
                                            {ex.meta?.difficulty && (
                                              <span
                                                className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                                  ex.meta.difficulty === 'Beginner'
                                                    ? 'bg-green-100 text-green-700'
                                                    : ex.meta.difficulty === 'Intermediate'
                                                    ? 'bg-yellow-100 text-yellow-700'
                                                    : 'bg-red-100 text-red-700'
                                                }`}
                                              >
                                                🎯 {ex.meta.difficulty}
                                              </span>
                                            )}
                                            {ex.scope && (
                                              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700">
                                                {ex.scope === 'global' ? '🌍 Global' : '👤 Coach'}
                                              </span>
                                            )}
                                          </div>
                                          {ex.owner?.pseudo && (
                                            <p className="text-xs text-gray-500 mt-1">
                                              Créé par : {ex.owner.pseudo}
                                            </p>
                                          )}
                                        </div>
                                        <button
                                          className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-green-700 transition whitespace-nowrap"
                                          onClick={() => addExerciseToSession(block.id, week.id, session.id, ex)}
                                        >
                                          ➕ Ajouter
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {exercisePagination && exercisePagination.totalPages > 1 && (
                              <div className="flex items-center justify-between mt-4 text-sm text-blue-900">
                                <button
                                  onClick={() => handleExercisePageChange('prev')}
                                  disabled={exercisePagination.page <= 1}
                                  className="px-3 py-1 bg-white border border-blue-300 rounded-lg hover:bg-blue-100 transition disabled:opacity-50"
                                >
                                  ← Précédent
                                </button>
                                <span className="font-medium">
                                  Page {exercisePagination.page} sur {exercisePagination.totalPages}
                                </span>
                                <button
                                  onClick={() => handleExercisePageChange('next')}
                                  disabled={exercisePagination.page >= exercisePagination.totalPages}
                                  className="px-3 py-1 bg-white border border-blue-300 rounded-lg hover:bg-blue-100 transition disabled:opacity-50"
                                >
                                  Suivant →
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => addSession(block.id, week.id)}
                    className="mt-3 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition"
                  >
                    + Add Session
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => addWeek(block.id)}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
            >
              + Add Week
            </button>
          </div>
        ))}
      </div>

      {blocks.length === 0 && (
        <div className="p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-600 mb-4">No blocks added yet</p>
          <button
            onClick={addBlock}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={18} />
            Add First Block
          </button>
        </div>
      )}

      {blocks.length > 0 && (
        <div className="mb-8">
          <button
            onClick={addBlock}
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 font-medium transition"
          >
            <Plus size={18} />
            Add Block
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={saveProgram}
          disabled={isSaving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 flex items-center gap-2 transition"
        >
          <Save size={18} />
          {isSaving ? 'Saving...' : 'Save'}
        </button>

        <button
          onClick={saveAndQuit}
          disabled={isSaving}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 flex items-center gap-2 transition"
        >
          <LogOut size={18} />
          Save & Quit
        </button>

        <button
          onClick={() => router.push('/programs')}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition"
        >
          Cancel
        </button>
      </div>

      {/* Exercise Configuration Modal */}
      {showConfigModal && pendingExercise && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-0 max-w-lg w-full shadow-2xl overflow-hidden">
            
            {/* Modal Header - Exercise Info */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{pendingExercise.name}</h2>
                  {pendingExercise.description && (
                    <p className="text-blue-100 text-sm mt-2">{pendingExercise.description}</p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowConfigModal(false);
                    setPendingExercise(null);
                    setPendingSessionInfo(null);
                  }}
                  className="text-blue-100 hover:text-white text-2xl font-bold leading-none"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Body - Configuration */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-6">
                
                {/* Format Selection */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="text-lg">📋</span>
                    <span>Exercise Format</span>
                  </label>
                  <select
                    value={exerciseConfig.format || 'standard'}
                    onChange={(e) => 
                      setExerciseConfig({ ...exerciseConfig, format: e.target.value })
                    }
                    className="w-full p-3 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                  >
                    <option value="standard">📊 Standard (Sets × Reps)</option>
                    <option value="EMOM">⏱️ EMOM (Every Minute On the Minute)</option>
                    <option value="AMRAP">🏃 AMRAP (As Many Reps As Possible)</option>
                    <option value="time">⏰ Time-based</option>
                    <option value="distance">📏 Distance-based</option>
                  </select>
                </div>

                {/* Sets Input */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="text-lg">⚙️</span>
                    <span>Number of Sets</span>
                  </label>
                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                    <button
                      onClick={() => setExerciseConfig({ 
                        ...exerciseConfig, 
                        sets: Math.max(1, (exerciseConfig.sets || 3) - 1) 
                      })}
                      className="w-12 h-12 flex items-center justify-center bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-bold text-xl transition"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={exerciseConfig.sets || 3}
                      onChange={(e) => 
                        setExerciseConfig({ ...exerciseConfig, sets: Math.max(1, parseInt(e.target.value) || 3) })
                      }
                      className="flex-1 p-3 border-2 border-gray-300 rounded-lg text-center text-gray-900 font-bold text-xl focus:border-blue-500"
                    />
                    <button
                      onClick={() => setExerciseConfig({ 
                        ...exerciseConfig, 
                        sets: Math.min(20, (exerciseConfig.sets || 3) + 1) 
                      })}
                      className="w-12 h-12 flex items-center justify-center bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-bold text-xl transition"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Reps Input */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="text-lg">🔄</span>
                    <span>Reps per Set</span>
                  </label>
                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                    <button
                      onClick={() => setExerciseConfig({ 
                        ...exerciseConfig, 
                        reps: Math.max(1, (exerciseConfig.reps || 10) - 1) 
                      })}
                      className="w-12 h-12 flex items-center justify-center bg-green-500 text-white rounded-lg hover:bg-green-600 font-bold text-xl transition"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={exerciseConfig.reps || 10}
                      onChange={(e) => 
                        setExerciseConfig({ ...exerciseConfig, reps: Math.max(1, parseInt(e.target.value) || 10) })
                      }
                      className="flex-1 p-3 border-2 border-gray-300 rounded-lg text-center text-gray-900 font-bold text-xl focus:border-green-500"
                    />
                    <button
                      onClick={() => setExerciseConfig({ 
                        ...exerciseConfig, 
                        reps: Math.min(100, (exerciseConfig.reps || 10) + 1) 
                      })}
                      className="w-12 h-12 flex items-center justify-center bg-green-500 text-white rounded-lg hover:bg-green-600 font-bold text-xl transition"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Weight Input (Optional) */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="text-lg">⚖️</span>
                    <span>Weight (kg)</span>
                    <span className="text-xs font-normal text-gray-500">optionnel</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={exerciseConfig.weight || ''}
                    onChange={(e) => 
                      setExerciseConfig({ ...exerciseConfig, weight: e.target.value ? parseFloat(e.target.value) : undefined })
                    }
                    className="w-full p-3 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
                    placeholder="Ex: 20.5 kg"
                  />
                </div>

                {/* Duration Input (Optional) */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="text-lg">⏱️</span>
                    <span>Duration (seconds)</span>
                    <span className="text-xs font-normal text-gray-500">optionnel</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={exerciseConfig.duration || ''}
                    onChange={(e) => 
                      setExerciseConfig({ ...exerciseConfig, duration: e.target.value ? parseInt(e.target.value) : undefined })
                    }
                    className="w-full p-3 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition"
                    placeholder="Ex: 60 secondes"
                  />
                </div>

                {/* Notes Input (Optional) */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="text-lg">📝</span>
                    <span>Notes & Instructions</span>
                    <span className="text-xs font-normal text-gray-500">optionnel</span>
                  </label>
                  <textarea
                    value={exerciseConfig.notes || ''}
                    onChange={(e) => 
                      setExerciseConfig({ ...exerciseConfig, notes: e.target.value })
                    }
                    className="w-full p-3 border-2 border-gray-300 rounded-lg text-gray-900 font-medium focus:border-gray-500 focus:ring-2 focus:ring-gray-200 transition resize-none"
                    rows={3}
                    placeholder="Ex: Focus sur la forme, bien contrôler la descente..."
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer - Actions */}
            <div className="bg-gray-50 border-t border-gray-200 p-6 flex gap-3">
              <button
                onClick={() => {
                  setShowConfigModal(false);
                  setPendingExercise(null);
                  setPendingSessionInfo(null);
                }}
                className="flex-1 px-4 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 font-bold transition flex items-center justify-center gap-2"
              >
                <span>✕</span>
                <span>Annuler</span>
              </button>
              <button
                onClick={confirmExerciseWithConfig}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold transition flex items-center justify-center gap-2 shadow-lg"
              >
                <span>✓</span>
                <span>Ajouter l'exercice</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Choose a Template</h2>
                  <p className="text-green-100 text-sm mt-2">Use an existing program as a starting point</p>
                </div>
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="text-green-100 hover:text-white text-2xl font-bold leading-none"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              {availablePrograms.length > 0 ? (
                <div className="space-y-3">
                  {availablePrograms.map((program: any) => (
                    <button
                      key={program.id}
                      onClick={() => useTemplateProgram(program.id)}
                      className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition"
                    >
                      <div className="font-semibold text-gray-900">{program.title}</div>
                      {program.description && (
                        <div className="text-sm text-gray-600 mt-1">{program.description}</div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">No programs available. Create a program first to use as template.</p>
              )}
            </div>

            <div className="bg-gray-50 border-t border-gray-200 p-6 flex gap-3">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="flex-1 px-4 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 font-bold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

