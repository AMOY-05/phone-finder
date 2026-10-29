/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * User Dashboard Screen for PhoneFinder
 */

import React from 'react';
import {
  Smartphone,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Radio,
  Battery,
  MapPin,
  ExternalLink,
  ChevronRight,
  PlusCircle,
  Bell,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { AlertNotification, RegisteredDevice } from '../types/phonefinder';
import { calculateLocationFreshness, determineDeviceState } from '../utils/locationRules';

interface DashboardProps {
  devices: RegisteredDevice[];
  notifications: AlertNotification[];
  onSelectDevice: (deviceId: string) => void;
  onOpenRegisterModal: () => void;
  onNavigateTab: (tab: any) => void;
  onRefreshData: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  devices,
  notifications,
  onSelectDevice,
  onOpenRegisterModal,
  onNavigateTab,
  onRefreshData,
}) => {
  // Compute metric breakdowns
  const onlineFreshCount = devices.filter((d) => {
    const state = determineDeviceState({
      isOnline: d.isOnline,
      permissionGranted: d.permissionGranted,
      locationServicesEnabled: d.locationServicesEnabled,
      batteryLevelPercent: d.batteryLevelPercent,
      lastReportedTimestamp: d.lastLocation?.timestamp,
      hasLocationData: !!d.lastLocation,
    });
    return state.code === 'ONLINE_FRESH';
  }).length;

  const lastKnownCount = devices.filter((d) => {
    const state = determineDeviceState({
      isOnline: d.isOnline,
      permissionGranted: d.permissionGranted,
      locationServicesEnabled: d.locationServicesEnabled,
      batteryLevelPercent: d.batteryLevelPercent,
      lastReportedTimestamp: d.lastLocation?.timestamp,
      hasLocationData: !!d.lastLocation,
    });
    return state.code === 'OFFLINE_LAST_KNOWN';
  }).length;

  const attentionCount = devices.filter(
    (d) => !d.permissionGranted || !d.locationServicesEnabled || d.batteryLevelPercent <= 5 || d.lostModeEnabled
  ).length;

  const unreadAlerts = notifications.filter((n) => !n.read).slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs uppercase font-mono tracking-wider text-emerald-400 font-semibold">
              Recovery Sentinel Active
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Device Command Center</h1>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Monitoring {devices.length} registered hardware endpoints. Coordinates are protected by end-to-end access boundaries and automated privacy retention.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefreshData}
            title="Refresh status"
            className="flex items-center gap-2 px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Poll Updates</span>
          </button>
          <button
            onClick={onOpenRegisterModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-500/20 transition-all hover:scale-102"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Register New Device</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Devices */}
        <div
          onClick={() => onNavigateTab('devices')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Registered Devices</span>
            <Smartphone className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{devices.length}</div>
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
            <span>{devices.filter((d) => d.platform === 'android').length} Android, {devices.filter((d) => d.platform === 'ios').length} iOS</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>

        {/* Card 2: Online & Fresh */}
        <div
          onClick={() => onNavigateTab('recovery')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Live & Fresh Fix</span>
            <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
          </div>
          <div className="text-3xl font-bold text-emerald-600">{onlineFreshCount}</div>
          <div className="text-xs text-emerald-700 mt-1 flex items-center justify-between">
            <span>Actively pinging GPS</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>

        {/* Card 3: Offline (Last Known) */}
        <div
          onClick={() => onNavigateTab('recovery')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Last Known Fix</span>
            <Clock className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-3xl font-bold text-orange-600">{lastKnownCount}</div>
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
            <span>Offline with cached coords</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>

        {/* Card 4: Requiring Attention */}
        <div
          onClick={() => onNavigateTab('alerts')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Attention Needed</span>
            <AlertTriangle className={`w-4 h-4 ${attentionCount > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
          </div>
          <div className={`text-3xl font-bold ${attentionCount > 0 ? 'text-amber-600' : 'text-slate-700'}`}>
            {attentionCount}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
            <span>{attentionCount > 0 ? 'Permission or battery warnings' : 'All devices healthy'}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Main Grid: Devices Quick Overview + Alerts & Security */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Quick List (2 cols on lg) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Your Registered Devices</h2>
            <button
              onClick={() => onNavigateTab('devices')}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              <span>Manage All ({devices.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {devices.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                  <Smartphone className="w-8 h-8" />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h3 className="text-base font-bold text-slate-900">No Devices Registered Yet</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    PhoneFinder is ready to protect your smartphones. Register an Android device, Apple iPhone, or companion browser node to begin streaming telemetry and arming recovery tools.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={onOpenRegisterModal}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-sm shadow-blue-500/20 flex items-center gap-2 transition-all hover:scale-102"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Register First Device</span>
                  </button>
                  <button
                    onClick={() => onNavigateTab('mobile_specs')}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Mobile Companion Docs
                  </button>
                </div>
              </div>
            ) : (
              devices.map((device) => {
              const state = determineDeviceState({
                isOnline: device.isOnline,
                permissionGranted: device.permissionGranted,
                locationServicesEnabled: device.locationServicesEnabled,
                batteryLevelPercent: device.batteryLevelPercent,
                lastReportedTimestamp: device.lastLocation?.timestamp,
                hasLocationData: !!device.lastLocation,
              });

              const freshness = calculateLocationFreshness(device.lastLocation?.timestamp);

              return (
                <div
                  key={device.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:border-blue-400 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                        device.platform === 'ios'
                          ? 'bg-slate-100 text-slate-800'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {device.platform === 'ios' ? '' : '🤖'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-sm">{device.name}</span>
                        {device.lostModeEnabled && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-100 text-red-700 font-bold border border-red-300">
                            LOST MODE
                          </span>
                        )}
                        {device.alarmActive && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-600 text-white font-bold animate-pulse">
                            SIREN ON
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-500 mt-0.5">
                        {device.model} • {device.osVersion}
                      </div>

                      {/* State Badge & Freshness */}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                            state.code === 'ONLINE_FRESH'
                              ? 'bg-emerald-100 text-emerald-800'
                              : state.code === 'OFFLINE_LAST_KNOWN'
                              ? 'bg-orange-100 text-orange-800'
                              : state.code === 'PERMISSION_DENIED'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              state.code === 'ONLINE_FRESH'
                                ? 'bg-emerald-500'
                                : state.code === 'OFFLINE_LAST_KNOWN'
                                ? 'bg-orange-500'
                                : 'bg-amber-500'
                            }`}
                          ></span>
                          {state.title}
                        </span>

                        <span className="text-[11px] text-slate-500 font-mono">
                          {freshness.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right side: Battery & Actions */}
                  <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <Battery
                        className={`w-4 h-4 ${
                          device.batteryLevelPercent <= 20
                            ? 'text-red-500'
                            : device.batteryLevelPercent <= 50
                            ? 'text-amber-500'
                            : 'text-emerald-500'
                        }`}
                      />
                      <span className="font-medium font-mono">{device.batteryLevelPercent}%</span>
                      {device.isCharging && <span className="text-[10px] text-emerald-600 font-bold">⚡</span>}
                    </div>

                    <button
                      onClick={() => onSelectDevice(device.id)}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Locate on Map</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
          </div>
        </div>

        {/* Sidebar: Recent Alerts & Security Guarantees */}
        <div className="space-y-6">
          {/* Recent Alerts Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Recent Activity Alerts</h3>
              </div>
              <button
                onClick={() => onNavigateTab('alerts')}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                View all
              </button>
            </div>

            {unreadAlerts.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No unread security or status notifications.</p>
            ) : (
              <div className="space-y-3">
                {unreadAlerts.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1 hover:bg-blue-50/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{notif.title}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-[11px]">{notif.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Privacy & Security Guarantees Box */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-5 text-white shadow-sm border border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold">Privacy by Default</h3>
            </div>
            <ul className="text-xs text-slate-300 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Coordinates strictly validated with WGS84 bounding checks.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Automatic 30-day retention purge configured.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Zero covert surveillance; explicit user consent enforced.</span>
              </li>
            </ul>

            <div className="mt-4 pt-3 border-t border-slate-700 flex items-center justify-between">
              <button
                onClick={() => onNavigateTab('privacy')}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
              >
                <span>Privacy & Retention Settings</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
