'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Dumbbell,
  Heart,
  Clock,
  BookOpen,
  Play,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
} from 'lucide-react';
import { useState } from 'react';
import { authClient } from '@/lib/auth';

interface NavItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  badge?: string;
  submenu?: NavItem[];
}

export default function SidebarNavigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const user = authClient.getUser();

  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: <Home size={20} />,
    },
    {
      label: 'Exercises',
      icon: <Dumbbell size={20} />,
      submenu: [
        {
          label: 'Library',
          href: '/dashboard/exercises',
          icon: <BookOpen size={14} />,
        },
        {
          label: 'Favorites',
          href: '/dashboard/exercises/favorites',
          icon: <Heart size={14} />,
          badge: 'New',
        },
        {
          label: 'History',
          href: '/dashboard/exercises/history',
          icon: <Clock size={14} />,
          badge: 'New',
        },
      ],
    },
    {
      label: 'Programs',
      icon: <BookOpen size={20} />,
      submenu: [
        {
          label: 'My Programs',
          href: '/dashboard/programs',
          icon: <BookOpen size={14} />,
        },
        {
          label: 'Program Builder',
          href: '/dashboard/programs/builder',
          icon: <Menu size={14} />,
          badge: 'Enhanced',
        },
        {
          label: 'Templates',
          href: '/dashboard/programs/templates',
          icon: <Menu size={14} />,
        },
      ],
    },
    {
      label: 'Workouts',
      icon: <Play size={20} />,
      submenu: [
        {
          label: 'Active Workout',
          href: '/dashboard/workout',
          icon: <Play size={14} />,
        },
        {
          label: 'History',
          href: '/dashboard/workouts/history',
          icon: <Clock size={14} />,
        },
        {
          label: 'Statistics',
          href: '/dashboard/workouts/stats',
          icon: <Dumbbell size={14} />,
          badge: 'New',
        },
      ],
    },
    {
      label: 'Groups',
      href: '/dashboard/groups',
      icon: <Dumbbell size={20} />,
    },
    {
      label: 'Settings',
      href: '/dashboard/settings',
      icon: <Settings size={20} />,
    },
  ];

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + '/');
  };

  const handleLogout = () => {
    authClient.logout();
    window.location.href = '/';
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 bg-blue-600 text-white rounded-lg"
      >
        <Menu size={24} />
      </button>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white p-6 overflow-y-auto transition-transform duration-300 z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        {/* Logo/Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-blue-400 mb-1">GoBeyondFit</h1>
          <p className="text-sm text-gray-400">Workout Manager</p>
        </div>

        {/* User Info */}
        <div className="mb-8 p-4 bg-slate-800 rounded-lg">
          <p className="text-sm text-gray-400">Logged in as</p>
          <p className="font-semibold text-white truncate">{user?.pseudo || 'User'}</p>
          <p className="text-xs text-gray-500 capitalize">{user?.role || 'member'}</p>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-2 mb-8">
          {navItems.map((item, index) => (
            <div key={index}>
              {item.href ? (
                // Simple Link
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-slate-800'
                  }`}
                >
                  {item.icon}
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="text-xs bg-green-600 px-2 py-1 rounded">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ) : (
                // Submenu
                <>
                  <button
                    onClick={() =>
                      setExpandedMenu(expandedMenu === item.label ? null : item.label)
                    }
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      expandedMenu === item.label || item.submenu?.some((s) => isActive(s.href))
                        ? 'bg-slate-800 text-blue-400'
                        : 'text-gray-300 hover:bg-slate-800'
                    }`}
                  >
                    {item.icon}
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${
                        expandedMenu === item.label ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Submenu Items */}
                  {expandedMenu === item.label && item.submenu && (
                    <div className="mt-2 space-y-2 ml-4 border-l-2 border-slate-700">
                      {item.submenu.map((subitem, subindex) => (
                        <Link
                          key={subindex}
                          href={subitem.href || '#'}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm ${
                            isActive(subitem.href)
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-400 hover:text-gray-200 hover:bg-slate-800'
                          }`}
                        >
                          {subitem.icon}
                          <span className="flex-1">{subitem.label}</span>
                          {subitem.badge && (
                            <span className="text-xs bg-green-600 px-1.5 py-0.5 rounded">
                              {subitem.badge}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </nav>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-slate-800 rounded-lg transition-colors mt-auto"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
