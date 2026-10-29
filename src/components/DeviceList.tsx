/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Screen 5: Comprehensive Device Management List
 */

import React from 'react';
import {
  Smartphone,
  MapPin,
  Volume2,
  Trash2,
  PlusCircle,
  AlertTriangle,
  Battery,
  Shield,
  Clock,
  Radio,
  Lock,
} from 'lucide-react';
import { RegisteredDevice } from '../types/phonefinder';
import { calculateLocationFreshness, determineDeviceState } from '../utils/locationRules';

interface DeviceListProps {
  devices: RegisteredDevice[];
  onSelectDevice: (id: string) => void;
  onOpenRegisterModal: () => void;
  onTriggerAlarm: (id: string) => void;
  onDeregisterDevice: (id: string) => void;
  onToggleLostMode: (id: string, enabled: boolean) => void;
}

export const DeviceList: React.FC<DeviceListProps> = ({
  devices,
  onSelectDevice,
  onOpenRegisterModal,
  onTriggerAlarm,
  onDeregisterDevice,
  onToggleLostMode,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Device Hardware Registry</h2>
          <p className="text-xs text-slate-500 mt-1">
            Authorized smartphones paired with this PhoneFinder recovery account.
          </p>
        </div>
        <button
          onClick={onOpenRegisterModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Register New Device</span>
        </button>
      </div>

      {/* Devices Grid */}
      {devices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Smartphone className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-slate-900">No Hardware Devices Registered</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              You have not registered any phones yet. Add an Android phone, iPhone, or browser companion node to manage hardware profiles and coordinate security.
            </p>
          </div>
          <button
            onClick={onOpenRegisterModal}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 inline-flex items-center gap-2 transition-all hover:scale-102"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Register First Device</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {devices.map((device) => {
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
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header row: Icon, Name, Platform, Lost Badge */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-lg ${
                        device.platform === 'ios'
                          ? 'bg-slate-100 text-slate-900'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {device.platform === 'ios' ? '' : '🤖'}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{device.name}</h3>
                      <p className="text-xs text-slate-500">{device.model}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {device.lostModeEnabled && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-300">
                        LOST MODE
                      </span>
                    )}
                    {device.alarmActive && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white animate-pulse">
                        SIREN
                      </span>
                    )}
                  </div>
                </div>

                {/* Status & Freshness row */}
                <div className="space-y-2 py-3 border-y border-slate-100 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Connection State</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        state.code === 'ONLINE_FRESH'
                          ? 'bg-emerald-100 text-emerald-800'
                          : state.code === 'OFFLINE_LAST_KNOWN'
                          ? 'bg-orange-100 text-orange-800'
                          : state.code === 'PERMISSION_DENIED'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {state.title}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Location Freshness</span>
                    <span className="font-mono text-slate-700 text-[11px]">{freshness.label}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Battery & Power</span>
                    <span className="font-mono text-slate-700 flex items-center gap-1">
                      <Battery className="w-3.5 h-3.5 text-slate-500" />
                      {device.batteryLevelPercent}% {device.isCharging && '⚡'}
                    </span>
                  </div>

                  {/* Warning Pill if permission denied or location services off */}
                  {!device.permissionGranted && (
                    <div className="p-2 bg-amber-50 text-amber-800 rounded-lg text-[11px] flex items-center gap-2 border border-amber-200">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Background location permission revoked by user.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectDevice(device.id)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Locate</span>
                  </button>

                  <button
                    onClick={() => onTriggerAlarm(device.id)}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    title="Play remote ring siren"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Ring</span>
                  </button>

                  <button
                    onClick={() => onToggleLostMode(device.id, !device.lostModeEnabled)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                      device.lostModeEnabled
                        ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{device.lostModeEnabled ? 'Disarm Lost' : 'Lost Mode'}</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to deregister "${device.name}"? All cached telemetry will be removed.`)) {
                      onDeregisterDevice(device.id);
                    }
                  }}
                  title="Deregister device"
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    )}
    </div>
  );
};
