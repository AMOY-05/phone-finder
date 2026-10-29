/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Screen 8: Alerts & Recovery Notification Center
 */

import React from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Radio,
  Sliders,
  ShieldAlert,
} from 'lucide-react';
import { AlertNotification, PrivacyPreferences } from '../types/phonefinder';

interface AlertsViewProps {
  notifications: AlertNotification[];
  privacy: PrivacyPreferences;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onUpdatePrivacy: (updates: Partial<PrivacyPreferences>) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  notifications,
  privacy,
  onMarkAsRead,
  onMarkAllAsRead,
  onUpdatePrivacy,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Recovery Alerts & Event Stream</h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time notifications for location updates, reconnects, permission changes, and security events.
          </p>
        </div>
        <button
          onClick={onMarkAllAsRead}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Mark All Read</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notification Stream (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          {notifications.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-medium">No alerts recorded yet.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 rounded-xl border transition-all ${
                  notif.read
                    ? 'bg-white border-slate-200 opacity-80'
                    : 'bg-blue-50/40 border-blue-200 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        notif.severity === 'critical'
                          ? 'bg-red-100 text-red-600'
                          : notif.severity === 'warning'
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-blue-100 text-blue-600'
                      }`}
                    >
                      {notif.severity === 'critical' ? (
                        <ShieldAlert className="w-4 h-4" />
                      ) : notif.severity === 'warning' ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : (
                        <Info className="w-4 h-4" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-xs">{notif.title}</h4>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        )}
                        {notif.deviceName && (
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                            {notif.deviceName}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {notif.message}
                      </p>
                      <div className="text-[10px] text-slate-400 mt-2 font-mono flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(notif.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {!notif.read && (
                    <button
                      onClick={() => onMarkAsRead(notif.id)}
                      title="Mark as read"
                      className="text-slate-400 hover:text-blue-600 p-1"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Alert Configuration Toggles (1 col) */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Alert Notification Triggers</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Configure which events trigger immediate push notifications to your dashboard and registered email address.
            </p>

            <div className="space-y-3 pt-2">
              <label className="flex items-start justify-between gap-3 cursor-pointer">
                <div>
                  <div className="text-xs font-semibold text-slate-800">Fresh Coordinate Fix</div>
                  <div className="text-[11px] text-slate-500">Notify when a device reports an updated GPS fix</div>
                </div>
                <input
                  type="checkbox"
                  checked={privacy.notifyOnNewLocation}
                  onChange={(e) => onUpdatePrivacy({ notifyOnNewLocation: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 mt-0.5"
                />
              </label>

              <label className="flex items-start justify-between gap-3 cursor-pointer pt-2 border-t border-slate-100">
                <div>
                  <div className="text-xs font-semibold text-slate-800">Device Offline / Disconnect</div>
                  <div className="text-[11px] text-slate-500">Alert when a reporting device drops off the network</div>
                </div>
                <input
                  type="checkbox"
                  checked={privacy.notifyOnDisconnect}
                  onChange={(e) => onUpdatePrivacy({ notifyOnDisconnect: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 mt-0.5"
                />
              </label>

              <label className="flex items-start justify-between gap-3 cursor-pointer pt-2 border-t border-slate-100">
                <div>
                  <div className="text-xs font-semibold text-slate-800">Low Battery Warning (&le; 15%)</div>
                  <div className="text-[11px] text-slate-500">Urgent alert before power depletion to cache last coordinate</div>
                </div>
                <input
                  type="checkbox"
                  checked={privacy.notifyOnLowBattery}
                  onChange={(e) => onUpdatePrivacy({ notifyOnLowBattery: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 mt-0.5"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
