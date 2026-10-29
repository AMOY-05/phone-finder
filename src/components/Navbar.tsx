/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Navigation Bar for PhoneFinder
 */

import React from 'react';
import {
  Smartphone,
  Shield,
  MapPin,
  Clock,
  Bell,
  Lock,
  LifeBuoy,
  Volume2,
  VolumeX,
  Radio,
  FileCode2,
} from 'lucide-react';
import { AlertNotification, RegisteredDevice } from '../types/phonefinder';

export type ActiveTab =
  | 'dashboard'
  | 'devices'
  | 'recovery'
  | 'history'
  | 'alerts'
  | 'privacy'
  | 'help'
  | 'mobile_specs';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  devices: RegisteredDevice[];
  notifications: AlertNotification[];
  onStopAllAlarms: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  devices,
  notifications,
  onStopAllAlarms,
}) => {
  const hasActiveAlarm = devices.some((d) => d.alarmActive);
  const unreadAlerts = notifications.filter((n) => !n.read).length;

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <Shield className="w-4 h-4" /> },
    { id: 'devices', label: 'Devices', icon: <Smartphone className="w-4 h-4" />, badge: devices.length },
    { id: 'recovery', label: 'Recovery Map', icon: <MapPin className="w-4 h-4" /> },
    { id: 'history', label: 'Location History', icon: <Clock className="w-4 h-4" /> },
    { id: 'alerts', label: 'Alerts', icon: <Bell className="w-4 h-4" />, badge: unreadAlerts > 0 ? unreadAlerts : undefined },
    { id: 'privacy', label: 'Privacy & Security', icon: <Lock className="w-4 h-4" /> },
    { id: 'help', label: 'Emergency Guidance', icon: <LifeBuoy className="w-4 h-4" /> },
    { id: 'mobile_specs', label: 'Mobile & APIs', icon: <FileCode2 className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      {/* Active Alarm Global Banner if siren is sounding */}
      {hasActiveAlarm && (
        <div className="bg-red-600 text-white px-4 py-2 flex items-center justify-between text-xs font-semibold animate-pulse">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 animate-bounce" />
            <span>REMOTE ALARM SOUNDING: Siren activated at maximum volume on target device.</span>
          </div>
          <button
            onClick={onStopAllAlarms}
            className="bg-white text-red-700 px-3 py-1 rounded text-xs font-bold hover:bg-red-50 flex items-center gap-1 shadow transition-colors"
          >
            <VolumeX className="w-3.5 h-3.5" />
            <span>Mute / Stop Siren</span>
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <div
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">PhoneFinder</span>
                <span className="text-[10px] font-mono uppercase bg-blue-900/70 text-blue-300 border border-blue-700 px-1.5 py-0.2 rounded font-semibold">
                  SECURE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-normal">Cross-Platform Recovery System</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold leading-none ${
                        isActive
                          ? 'bg-white text-blue-700'
                          : item.id === 'alerts'
                          ? 'bg-amber-500 text-slate-900'
                          : 'bg-slate-700 text-slate-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User profile & Quick Emergency Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectTab('help')}
              className="hidden sm:inline-flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            >
              <LifeBuoy className="w-3.5 h-3.5 text-amber-400" />
              <span>Lost Phone?</span>
            </button>

            <button
              onClick={() => onSelectTab('privacy')}
              className="flex items-center gap-2 pl-3 border-l border-slate-800 text-left hover:opacity-90 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-blue-400">
                AM
              </div>
              <div className="hidden lg:block text-xs">
                <div className="font-semibold text-slate-200 leading-tight">Alex Morgan</div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Verified 2FA
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Horizontal Subnav */}
      <div className="md:hidden overflow-x-auto flex items-center gap-1 px-3 py-2 bg-slate-950 border-t border-slate-800 no-scrollbar">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs whitespace-nowrap ${
              activeTab === item.id ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </header>
  );
};
