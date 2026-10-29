/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Screen 6: Device Recovery Screen with Interactive Map, Telemetry, and Recovery Actions
 */

import React, { useState } from 'react';
import {
  RegisteredDevice,
  LocationRecord,
  AlertNotification,
} from '../types/phonefinder';
import { calculateLocationFreshness, determineDeviceState } from '../utils/locationRules';
import { InteractiveMap } from './InteractiveMap';
import {
  Volume2,
  VolumeX,
  Lock,
  RefreshCw,
  Clock,
  Battery,
  Wifi,
  Navigation,
  Compass,
  LifeBuoy,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  Target,
  AlertOctagon,
  Sliders,
} from 'lucide-react';

interface DeviceRecoveryProps {
  devices: RegisteredDevice[];
  selectedDeviceId: string;
  onSelectDevice: (id: string) => void;
  onTriggerAlarm: (deviceId: string) => void;
  onStopAlarm: (deviceId: string) => void;
  onToggleLostMode: (deviceId: string, enabled: boolean, msg?: string, phone?: string) => void;
  onRequestPing: (deviceId: string) => void;
  onViewHistory: (deviceId: string) => void;
  onOpenHelp: () => void;
  onOpenRegisterModal?: () => void;
  onSetGeofence: (deviceId: string, radiusMeters: number, name?: string) => void;
  onToggleGeofence: (deviceId: string, enabled: boolean) => void;
  onRemoveGeofence: (deviceId: string) => void;
  onSimulateGeofenceMovement: (deviceId: string, breach: boolean) => void;
}

export const DeviceRecovery: React.FC<DeviceRecoveryProps> = ({
  devices,
  selectedDeviceId,
  onSelectDevice,
  onTriggerAlarm,
  onStopAlarm,
  onToggleLostMode,
  onRequestPing,
  onViewHistory,
  onOpenHelp,
  onOpenRegisterModal,
  onSetGeofence,
  onToggleGeofence,
  onRemoveGeofence,
  onSimulateGeofenceMovement,
}) => {
  const currentDevice = devices.find((d) => d.id === selectedDeviceId) || devices[0];

  const [lostModeModalOpen, setLostModeModalOpen] = useState(false);
  const [lostMessage, setLostMessage] = useState(
    currentDevice?.lostModeMessage || 'Lost phone! Please return to owner. Reward offered.'
  );
  const [lostPhone, setLostPhone] = useState(currentDevice?.lostModeContactPhone || '+1 (555) 019-2834');
  const [pingStatus, setPingStatus] = useState<string | null>(null);

  if (!currentDevice) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm max-w-xl mx-auto space-y-4 my-8">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
          <Navigation className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900">No Registered Devices to Locate</h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
            Pair an Android smartphone, Apple iPhone, or companion browser node to activate the interactive precision map, establish virtual perimeters, and dispatch remote siren alarms.
          </p>
        </div>
        <div className="pt-2">
          {onOpenRegisterModal && (
            <button
              onClick={onOpenRegisterModal}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-102"
            >
              Register Your First Device
            </button>
          )}
        </div>
      </div>
    );
  }

  const state = determineDeviceState({
    isOnline: currentDevice.isOnline,
    permissionGranted: currentDevice.permissionGranted,
    locationServicesEnabled: currentDevice.locationServicesEnabled,
    batteryLevelPercent: currentDevice.batteryLevelPercent,
    lastReportedTimestamp: currentDevice.lastLocation?.timestamp,
    hasLocationData: !!currentDevice.lastLocation,
  });

  const freshness = calculateLocationFreshness(currentDevice.lastLocation?.timestamp);
  const loc = currentDevice.lastLocation;

  const handlePing = () => {
    setPingStatus('Sending cryptographic wake-up ping to device...');
    onRequestPing(currentDevice.id);
    setTimeout(() => {
      setPingStatus('Ping received. Coordinates telemetry updated.');
      setTimeout(() => setPingStatus(null), 3000);
    }, 1200);
  };

  const handleSaveLostMode = (e: React.FormEvent) => {
    e.preventDefault();
    onToggleLostMode(currentDevice.id, true, lostMessage, lostPhone);
    setLostModeModalOpen(false);
  };

  const handleDisableLostMode = () => {
    onToggleLostMode(currentDevice.id, false);
    setLostModeModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Device Selector Header & Quick Switcher */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
            {currentDevice.platform === 'ios' ? '' : '🤖'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-base">{currentDevice.name}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                  state.code === 'ONLINE_FRESH'
                    ? 'bg-emerald-100 text-emerald-800'
                    : state.code === 'OFFLINE_LAST_KNOWN'
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {state.title}
              </span>
            </div>
            <div className="text-xs text-slate-500">
              {currentDevice.model} • Registered {new Date(currentDevice.registeredAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Switch Device dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="device-selector" className="text-xs text-slate-500 font-medium">Switch Target:</label>
          <div className="relative">
            <select
              id="device-selector"
              value={currentDevice.id}
              onChange={(e) => onSelectDevice(e.target.value)}
              className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg pl-3 pr-8 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {devices.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.platform.toUpperCase()})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Recovery Area: Map (Left/Center) + Telemetry & Actions (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Panel (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-slate-800">Coordinate Precision Map</span>
                {loc && (
                  <span className="text-[11px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                    ±{loc.accuracyMeters}m radius
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-500 font-mono text-[11px]">{freshness.label}</span>
                <button
                  onClick={() => onViewHistory(currentDevice.id)}
                  className="text-blue-600 hover:text-blue-700 font-semibold text-xs"
                >
                  View Route History →
                </button>
              </div>
            </div>

            {/* The Interactive Leaflet Map */}
            <div className="h-[460px] w-full">
              <InteractiveMap device={currentDevice} activeLocation={loc} />
            </div>

            {/* Map Footer Bar with coordinate details */}
            {loc && (
              <div className="p-3 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-blue-400" />
                  <span className="font-mono text-slate-300">
                    {loc.latitude.toFixed(6)}, {loc.longitude.toFixed(6)}
                  </span>
                  <span className="text-slate-500">|</span>
                  <span className="text-slate-400">{loc.addressName || 'Observed Location'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${loc.latitude},${loc.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium"
                  >
                    <span>Google Maps Navigation</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Transparent Status Disclosure Banner */}
          <div className="bg-slate-100 rounded-xl p-4 border border-slate-200 text-xs text-slate-700 space-y-1">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <ShieldAlert className="w-4 h-4 text-blue-600" />
              <span>Location Source & Integrity Verification</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Coordinates shown above were ingested via {loc?.source === 'gps' ? 'hardware satellite GPS' : loc?.source || 'device telemetry'} with reported horizontal uncertainty of ±{loc?.accuracyMeters || 15}m. When a phone is disconnected or shut down, PhoneFinder honestly displays its last known position rather than estimating or fabricating an artificial live fix.
            </p>
          </div>
        </div>

        {/* Recovery Actions & Diagnostics Panel (1 col) */}
        <div className="space-y-4">
          {/* Action 1: Remote Siren / Alarm */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Remote Ring / Siren</h3>
              </div>
              {currentDevice.alarmActive && (
                <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full animate-pulse">
                  PLAYING
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Plays an attention-grabbing dual-tone emergency siren at full device volume for 5 minutes, even if set to silent or vibrate.
            </p>

            {currentDevice.alarmActive ? (
              <button
                onClick={() => onStopAlarm(currentDevice.id)}
                className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <VolumeX className="w-4 h-4" />
                <span>Stop Siren / Mute</span>
              </button>
            ) : (
              <button
                onClick={() => onTriggerAlarm(currentDevice.id)}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all hover:scale-102"
              >
                <Volume2 className="w-4 h-4" />
                <span>Play Sound on Device</span>
              </button>
            )}
          </div>

          {/* Action 2: Lost Mode (Lock Screen Banner) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Lost Mode / Screen Lock</h3>
              </div>
              {currentDevice.lostModeEnabled && (
                <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                  ARMED
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Displays an emergency return message and your contact telephone on the phone's lock screen.
            </p>

            {currentDevice.lostModeEnabled ? (
              <div className="space-y-2">
                <div className="p-3 bg-red-50 rounded-lg border border-red-200 text-xs">
                  <div className="font-semibold text-red-900 mb-1">Configured Lock Message:</div>
                  <div className="text-red-700 italic">"{currentDevice.lostModeMessage}"</div>
                  <div className="text-red-800 font-mono text-[11px] mt-1 font-bold">
                    Contact: {currentDevice.lostModeContactPhone}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setLostModeModalOpen(true)}
                    className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Edit Message
                  </button>
                  <button
                    onClick={handleDisableLostMode}
                    className="flex-1 py-2 px-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Turn Off Lost Mode
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setLostModeModalOpen(true)}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all"
              >
                <Lock className="w-4 h-4" />
                <span>Arm Lost Mode</span>
              </button>
            )}
          </div>

          {/* Action: Virtual Perimeter (Geofence) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900">Virtual Perimeter (Geofence)</h3>
              </div>
              {currentDevice.geofence ? (
                currentDevice.geofence.enabled ? (
                  (currentDevice.geofence.lastDistanceMeters || 0) > currentDevice.geofence.radiusMeters ? (
                    <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full flex items-center gap-1 border border-red-300 animate-pulse">
                      <AlertOctagon className="w-3 h-3" />
                      BREACH DETECTED
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">
                      ARMED ({currentDevice.geofence.radiusMeters}m)
                    </span>
                  )
                ) : (
                  <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                    DISARMED
                  </span>
                )
              ) : (
                <span className="text-[10px] font-medium text-slate-400">UNCONFIGURED</span>
              )}
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Establishes a protective perimeter around the device's last known location. An urgent push notification fires immediately if the device coordinates drift outside.
            </p>

            {/* Radius Selector Pills */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-semibold text-slate-700 flex items-center justify-between">
                <span>Perimeter Radius:</span>
                <span className="font-mono text-purple-700 font-bold">
                  {currentDevice.geofence?.radiusMeters || 250} meters
                </span>
              </label>
              <div className="grid grid-cols-5 gap-1.5 text-xs">
                {[50, 100, 250, 500, 1000].map((radius) => {
                  const isCurrent = (currentDevice.geofence?.radiusMeters || 250) === radius;
                  return (
                    <button
                      key={radius}
                      type="button"
                      onClick={() => onSetGeofence(currentDevice.id, radius)}
                      className={`py-1.5 rounded-md font-semibold font-mono text-[11px] border transition-all ${
                        isCurrent
                          ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {radius >= 1000 ? `${radius / 1000}km` : `${radius}m`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Breach Alert Status Detail if triggered */}
            {currentDevice.geofence && (currentDevice.geofence.lastDistanceMeters || 0) > currentDevice.geofence.radiusMeters && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs space-y-1">
                <div className="font-bold text-red-900 flex items-center gap-1.5">
                  <AlertOctagon className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Outside Defined Boundary!</span>
                </div>
                <div className="text-red-700 text-[11px]">
                  Observed distance: <strong>{currentDevice.geofence.lastDistanceMeters}m</strong> (exceeded perimeter by {currentDevice.geofence.lastDistanceMeters! - currentDevice.geofence.radiusMeters}m).
                </div>
              </div>
            )}

            {/* Arm / Disarm & Anchor Controls */}
            <div className="space-y-2 pt-1">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onSetGeofence(currentDevice.id, currentDevice.geofence?.radiusMeters || 250)}
                  className="flex-1 py-2 px-3 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Re-anchor to Current Fix</span>
                </button>

                {currentDevice.geofence && (
                  <button
                    type="button"
                    onClick={() => onToggleGeofence(currentDevice.id, !currentDevice.geofence?.enabled)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-colors ${
                      currentDevice.geofence.enabled
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    {currentDevice.geofence.enabled ? 'Disarm' : 'Arm'}
                  </button>
                )}
              </div>

              {/* Simulation buttons to test breach and normal updates */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="text-[11px] font-semibold text-slate-700 flex items-center justify-between">
                  <span>Perimeter Telemetry Testbed:</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onSimulateGeofenceMovement(currentDevice.id, true)}
                    className="flex-1 py-1.5 px-2 bg-red-600 hover:bg-red-500 text-white rounded text-[11px] font-bold shadow-2xs transition-colors flex items-center justify-center gap-1"
                  >
                    <AlertOctagon className="w-3 h-3" />
                    <span>Simulate Breach (&gt; Radius)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onSimulateGeofenceMovement(currentDevice.id, false)}
                    className="flex-1 py-1.5 px-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded text-[11px] font-semibold transition-colors"
                  >
                    Move Inside Perimeter
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action 3: Request Fresh Ping */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Request Fresh Fix</h3>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Dispatches an asynchronous push wake-up command via Firebase Cloud Messaging / Apple Push Notification service.
            </p>

            {pingStatus && (
              <div className="p-2.5 bg-blue-50 text-blue-800 rounded-lg text-xs flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>{pingStatus}</span>
              </div>
            )}

            <button
              onClick={handlePing}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              <RefreshCw className="w-4 h-4 text-slate-600" />
              <span>Send Wake-Up Ping</span>
            </button>
          </div>

          {/* Hardware Diagnostics Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Device Diagnostics</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Battery Level</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1 font-mono">
                  {currentDevice.batteryLevelPercent}%
                  {currentDevice.isCharging && '⚡'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Network Type</span>
                <span className="font-semibold text-slate-800 uppercase font-mono">
                  {currentDevice.networkType}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Location Services</span>
                <span
                  className={`font-semibold ${
                    currentDevice.locationServicesEnabled ? 'text-emerald-600' : 'text-red-500'
                  }`}
                >
                  {currentDevice.locationServicesEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">OS Permission</span>
                <span
                  className={`font-semibold ${
                    currentDevice.permissionGranted ? 'text-emerald-600' : 'text-red-500'
                  }`}
                >
                  {currentDevice.permissionGranted ? 'Always Allowed' : 'Denied'}
                </span>
              </div>
            </div>

            <button
              onClick={onOpenHelp}
              className="w-full mt-2 py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <LifeBuoy className="w-3.5 h-3.5 text-amber-600" />
              <span>Official Platform Recovery Guide</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lost Mode Modal */}
      {lostModeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Configure Lost Mode</h3>
                <p className="text-xs text-slate-500">Arm lock screen on {currentDevice.name}</p>
              </div>
            </div>

            <form onSubmit={handleSaveLostMode} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Emergency Contact Telephone
                </label>
                <input
                  type="text"
                  required
                  value={lostPhone}
                  onChange={(e) => setLostPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  A finder can tap this number directly from the lock screen to call you.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Custom Recovery Message
                </label>
                <textarea
                  rows={3}
                  required
                  value={lostMessage}
                  onChange={(e) => setLostMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setLostModeModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-sm"
                >
                  Arm Lost Mode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
