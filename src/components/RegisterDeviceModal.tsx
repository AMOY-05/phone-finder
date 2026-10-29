/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Device Registration Dialog with Browser GPS capture support
 */

import React, { useState } from 'react';
import { Smartphone, X, CheckCircle2, Navigation, AlertCircle } from 'lucide-react';
import { PlatformType } from '../types/phonefinder';

interface RegisterDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (device: {
    name: string;
    platform: PlatformType;
    model: string;
    osVersion: string;
    batteryLevel?: number;
    initialCoords?: { latitude: number; longitude: number; accuracy: number };
  }) => void;
}

export const RegisterDeviceModal: React.FC<RegisterDeviceModalProps> = ({
  isOpen,
  onClose,
  onRegister,
}) => {
  const [name, setName] = useState('');
  const [platform, setPlatform] = useState<PlatformType>('android');
  const [model, setModel] = useState('');
  const [osVersion, setOsVersion] = useState('');
  const [useCurrentGps, setUseCurrentGps] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number; accuracy: number } | null>(null);

  if (!isOpen) return null;

  const handleCaptureGps = () => {
    if (!navigator.geolocation) {
      setGpsStatus('Geolocation not supported on this browser.');
      return;
    }
    setGpsStatus('Acquiring current GPS coordinates...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy || 10),
        });
        setGpsStatus(`Captured fix: ${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
      },
      (err) => {
        setGpsStatus(`Could not acquire GPS: ${err.message}`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onRegister({
      name: name.trim(),
      platform,
      model: model.trim() || (platform === 'ios' ? 'Apple iPhone' : 'Android Device'),
      osVersion: osVersion.trim() || (platform === 'ios' ? 'iOS 18.2' : 'Android 15'),
      batteryLevel: 94,
      initialCoords: coords || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Register Device Endpoint</h3>
            <p className="text-xs text-slate-500">Pair an Android, iOS, or companion device</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Device Friendly Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Work Pixel 9 Pro or Personal iPhone"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Operating System Platform</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'android', label: 'Android' },
                { id: 'ios', label: 'Apple iOS' },
                { id: 'web_companion', label: 'Browser Node' },
              ].map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPlatform(p.id as any)}
                  className={`py-2 px-3 rounded-lg font-bold border transition-all ${
                    platform === p.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Hardware Model</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. Pixel 9 Pro"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">OS Build Version</label>
              <input
                type="text"
                value={osVersion}
                onChange={(e) => setOsVersion(e.target.value)}
                placeholder="e.g. Android 15"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
          </div>

          {/* Optional GPS coordinate capture */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800">Initial GPS Telemetry</span>
              <button
                type="button"
                onClick={handleCaptureGps}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-blue-600 rounded-md font-semibold text-[11px] flex items-center gap-1 shadow-2xs"
              >
                <Navigation className="w-3 h-3" />
                <span>Probe Current Sensor</span>
              </button>
            </div>
            {gpsStatus && (
              <p className="text-[11px] text-slate-600 font-mono">{gpsStatus}</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm"
            >
              Pair & Register Device
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
