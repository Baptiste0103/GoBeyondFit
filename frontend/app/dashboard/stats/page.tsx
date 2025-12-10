'use client';

import { Award, TrendingUp, Flame } from 'lucide-react';
import { useGetStats, useGetBadgeProgress } from '@/hooks/use-api';

export default function StatsPage() {
  const { data: stats, isLoading: statsLoading } = useGetStats();
  const { data: badgeProgress, isLoading: badgeLoading } = useGetBadgeProgress();

  if (statsLoading || badgeLoading) return <div className="p-8">Chargement...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Statistiques</h1>
          <p className="text-slate-400">Votre progression et vos réalisations</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Sessions Completed */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-blue-100">Séances Complétées</h3>
              <TrendingUp className="w-5 h-5 text-blue-200" />
            </div>
            <p className="text-3xl font-bold">{(stats as any)?.completedSessions || 0}</p>
            <p className="text-sm text-blue-200 mt-2">
              {(stats as any)?.completionRate || 0}% de complétion
            </p>
          </div>

          {/* Max Weight */}
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-purple-100">Poids Max</h3>
              <Award className="w-5 h-5 text-purple-200" />
            </div>
            <p className="text-3xl font-bold">{(stats as any)?.maxWeight || 0}</p>
            <p className="text-sm text-purple-200 mt-2">kg</p>
          </div>

          {/* Average Weight */}
          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-green-100">Poids Moyen</h3>
              <TrendingUp className="w-5 h-5 text-green-200" />
            </div>
            <p className="text-3xl font-bold">{(stats as any)?.avgWeight || 0}</p>
            <p className="text-sm text-green-200 mt-2">kg par série</p>
          </div>

          {/* Current Streak */}
          <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-orange-100">Série Actuelle</h3>
              <Flame className="w-5 h-5 text-orange-200" />
            </div>
            <p className="text-3xl font-bold">{(stats as any)?.currentStreak || 0}</p>
            <p className="text-sm text-orange-200 mt-2">jours d'affilée</p>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-6">Détails</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-slate-700">
                <span className="text-slate-300">Total Séances Assignées</span>
                <span className="text-2xl font-bold text-white">{(stats as any)?.totalSessions || 0}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-700">
                <span className="text-slate-300">Séances Cette Semaine</span>
                <span className="text-2xl font-bold text-green-400">{(stats as any)?.sessionsThisWeek || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Volume Total (kg)</span>
                <span className="text-2xl font-bold text-blue-400">{(stats as any)?.totalVolume || 0}</span>
              </div>
            </div>
          </div>

          {/* Badge Progress Section */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-6">Progression Badges</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-slate-700">
                <span className="text-slate-300">Séances Complétées</span>
                <span className="text-2xl font-bold text-blue-400">{(badgeProgress as any)?.sessionsCompleted || 0}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-700">
                <span className="text-slate-300">Série Actuelle</span>
                <span className="text-2xl font-bold text-orange-400">{(badgeProgress as any)?.currentStreak || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Poids Max</span>
                <span className="text-2xl font-bold text-green-400">{(badgeProgress as any)?.maxWeight || 0} kg</span>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Continuez votre progression!</h2>
          <p className="text-blue-100 mb-4">
            Complétez plus de séances pour débloquer de nouveaux badges
          </p>
          <button className="px-6 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition">
            Voir les séances assignées
          </button>
        </div>
      </div>
    </div>
  );
}
