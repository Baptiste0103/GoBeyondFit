'use client';

import { Award, Lock, Unlock } from 'lucide-react';
import { useGetBadges, useGetUserBadges } from '@/hooks/use-api';

export default function BadgesPage() {
  const { data: badges, isLoading: badgesLoading } = useGetBadges();
  const { data: userBadgesData, isLoading: userBadgesLoading } = useGetUserBadges();

  const userBadgeIds = Array.isArray(userBadgesData) ? userBadgesData.map((ub: any) => ub.badgeId) : [];
  const badgesList = Array.isArray(badges) ? badges : [];
  const loading = badgesLoading || userBadgesLoading;

  if (loading) return <div className="p-8">Chargement...</div>;

  const badgeDetails: Record<string, any> = {
    session_completed: {
      title: 'Premier Pas',
      description: 'Complétez votre première séance',
      icon: '🎯',
      color: 'from-blue-600 to-blue-700',
    },
    perfect_session: {
      title: 'Séance Parfaite',
      description: 'Complétez une séance avec tous les exercices à 100%',
      icon: '⭐',
      color: 'from-yellow-600 to-yellow-700',
    },
    streak_7_days: {
      title: 'Une Semaine',
      description: 'Maintenez une série de 7 jours',
      icon: '🔥',
      color: 'from-red-600 to-red-700',
    },
    streak_30_days: {
      title: 'Un Mois',
      description: 'Maintenez une série de 30 jours',
      icon: '🚀',
      color: 'from-purple-600 to-purple-700',
    },
    personal_record: {
      title: 'Record Personnel',
      description: 'Établissez un nouveau record de poids',
      icon: '💪',
      color: 'from-green-600 to-green-700',
    },
    total_volume_milestone: {
      title: 'Maître du Volume',
      description: 'Atteignez 100,000 kg de volume total',
      icon: '🏋️',
      color: 'from-orange-600 to-orange-700',
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Badges</h1>
          <p className="text-slate-400">
            {userBadgeIds.length}/{badgesList.length} badges débloqués
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Progression Globale</h3>
            <span className="text-2xl font-bold text-blue-400">
              {Math.round((userBadgeIds.length / badgesList.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500"
              style={{
                width: `${(userBadgeIds.length / badgesList.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {badgesList.map((badge: any) => {
            const details = badgeDetails[badge.key as string];
            const isEarned = userBadgeIds.includes(badge.id);

            return (
              <div
                key={badge.id}
                className={`rounded-lg overflow-hidden border transition transform hover:scale-105 ${
                  isEarned
                    ? 'border-yellow-500 bg-gradient-to-br from-slate-800 to-slate-900'
                    : 'border-slate-700 bg-slate-800 opacity-60'
                }`}
              >
                {/* Badge Header */}
                <div
                  className={`bg-gradient-to-r ${
                    details?.color || 'from-slate-700 to-slate-800'
                  } p-6 text-center`}
                >
                  <div className="text-5xl mb-2">{details?.icon || '🏆'}</div>
                  <h3 className="text-xl font-bold text-white">
                    {details?.title || badge.title}
                  </h3>
                </div>

                {/* Badge Content */}
                <div className="p-6">
                  <p className="text-slate-300 text-sm mb-4">
                    {details?.description || badge.description}
                  </p>

                  <div className="flex items-center gap-2">
                    {isEarned ? (
                      <>
                        <Unlock className="w-5 h-5 text-yellow-500" />
                        <span className="text-yellow-500 text-sm font-semibold">Débloqué</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5 text-slate-500" />
                        <span className="text-slate-500 text-sm">Verrouillé</span>
                      </>
                    )}
                  </div>

                  {isEarned && (
                    <div className="mt-4 p-3 bg-blue-900 rounded-lg">
                      <p className="text-xs text-blue-200">Badge débloqué!</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-slate-800 rounded-lg p-8 border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-4">Comment débloquer les badges?</h2>
          <ul className="space-y-3 text-slate-300">
            <li className="flex gap-3">
              <span className="text-blue-400 font-bold">•</span>
              <span>Complétez vos séances d'entraînement assignées</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-400 font-bold">•</span>
              <span>Maintenez une série constante de jours d'entraînement</span>
            </li>
            <li className="flex gap-3">
              <span className="text-yellow-400 font-bold">•</span>
              <span>Établissez des records personnels en poids levé</span>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-400 font-bold">•</span>
              <span>Atteignez des jalons de volume total d'entraînement</span>
            </li>
            <li className="flex gap-3">
              <span className="text-red-400 font-bold">•</span>
              <span>Complétez toutes les exercices avec parfection</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
