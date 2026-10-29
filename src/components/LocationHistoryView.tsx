/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Screen 7: Location History & Route Trail View
 */

import React, { useState } from 'react';
import { LocationRecord, RegisteredDevice } from '../types/phonefinder';
import { InteractiveMap } from './InteractiveMap';
import {
  Clock,
  Download,
  Calendar,
  MapPin,
  Compass,
  ArrowRight,
  Filter,
  CheckCircle2,
  Share2,
} from 'lucide-react';

interface LocationHistoryViewProps {
  devices: RegisteredDevice[];
  selectedDeviceId: string;
  onSelectDevice: (id: string) => void;
  getLocationsForDevice: (deviceId: string) => LocationRecord[];
}

export const LocationHistoryView: React.FC<LocationHistoryViewProps> = ({
  devices,
  selectedDeviceId,
  onSelectDevice,
  getLocationsForDevice,
}) => {
  const [filterPeriod, setFilterPeriod] = useState<'all' | '24h' | '7d'>('all');
  const [activeLoc, setActiveLoc] = useState<LocationRecord | null>(null);

  const currentDevice = devices.find((d) => d.id === selectedDeviceId) || devices[0];
  const allLocations = currentDevice ? getLocationsForDevice(currentDevice.id) : [];

  if (!currentDevice) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm max-w-xl mx-auto space-y-4 my-8">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
          <Clock className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900">No Location History Available</h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
            Historical coordinates, route trails, and waypoint sequences will appear here once an authorized device begins reporting telemetry.
          </p>
        </div>
      </div>
    );
  }

  const now = Date.now();
  const filteredLocations = allLocations.filter((loc) => {
    if (filterPeriod === '24h') return loc.timestamp >= now - 24 * 3600 * 1000;
    if (filterPeriod === '7d') return loc.timestamp >= now - 7 * 24 * 3600 * 1000;
    return true;
  });

  const exportGPX = () => {
    if (filteredLocations.length === 0) return;
    const gpxPoints = filteredLocations
      .map(
        (l) =>
          `  <trkpt lat="${l.latitude}" lon="${l.longitude}"><time>${new Date(
            l.timestamp
          ).toISOString()}</time><desc>Accuracy: ${l.accuracyMeters}m</desc></trkpt>`
      )
      .join('\n');

    const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="PhoneFinder Recovery System">
  <trk>
    <name>Route for ${currentDevice?.name || 'Device'}</name>
    <trkseg>
${gpxPoints}
    </trkseg>
  </trk>
</gpx>`;

    const blob = new Blob([gpx], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `phonefinder_history_${currentDevice?.id || 'route'}.gpx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportGeoJSON = () => {
    if (filteredLocations.length === 0) return;
    const geojson = {
      type: 'FeatureCollection',
      features: filteredLocations.map((l) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [l.longitude, l.latitude],
        },
        properties: {
          id: l.id,
          timestamp: new Date(l.timestamp).toISOString(),
          accuracyMeters: l.accuracyMeters,
          source: l.source,
          batteryPercent: l.batteryLevelPercent,
        },
      })),
    };

    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `phonefinder_history_${currentDevice?.id || 'coords'}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Device Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Historical Route & Fix Timeline</h2>
          <p className="text-xs text-slate-500">
            Authorized breadcrumbs within user-configured retention policy for {currentDevice?.name}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Device selector */}
          <select
            value={currentDevice?.id}
            onChange={(e) => onSelectDevice(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {devices.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Time range pills */}
          <div className="bg-slate-100 p-1 rounded-lg flex items-center gap-1 text-xs">
            <button
              onClick={() => setFilterPeriod('all')}
              className={`px-2.5 py-1 rounded font-medium ${
                filterPeriod === 'all' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Retained
            </button>
            <button
              onClick={() => setFilterPeriod('24h')}
              className={`px-2.5 py-1 rounded font-medium ${
                filterPeriod === '24h' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Last 24 Hours
            </button>
            <button
              onClick={() => setFilterPeriod('7d')}
              className={`px-2.5 py-1 rounded font-medium ${
                filterPeriod === '7d' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7 Days
            </button>
          </div>

          {/* Export buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={exportGPX}
              disabled={filteredLocations.length === 0}
              title="Download GPX file for mapping software"
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 rounded-lg text-xs font-semibold flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>GPX</span>
            </button>
            <button
              onClick={exportGeoJSON}
              disabled={filteredLocations.length === 0}
              title="Download GeoJSON data"
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 rounded-lg text-xs font-semibold flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>GeoJSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Route Map + Chronological Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map with Breadcrumb Trail (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Route Trail & Waypoint Sequence</span>
              <span className="text-[11px] font-mono text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                {filteredLocations.length} Observation Waypoints
              </span>
            </div>

            <div className="h-[460px] w-full">
              <InteractiveMap
                device={currentDevice}
                locations={filteredLocations}
                activeLocation={activeLoc}
                showTrail={true}
                onSelectLocation={(loc) => setActiveLoc(loc)}
              />
            </div>
          </div>
        </div>

        {/* Chronological List of Fixes (1 col) */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col h-[520px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Timeline of Fixes</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">{filteredLocations.length} records</span>
          </div>

          {filteredLocations.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Clock className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-xs font-medium">No recorded locations in this time window.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredLocations.map((loc, idx) => {
                const isSelected = activeLoc?.id === loc.id;
                return (
                  <div
                    key={loc.id}
                    onClick={() => setActiveLoc(loc)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500 shadow-xs'
                        : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-700">
                          {idx + 1}
                        </span>
                        <span>{new Date(loc.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">
                        {new Date(loc.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 font-mono">
                      {loc.latitude.toFixed(5)}, {loc.longitude.toFixed(5)}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5 pt-1 border-t border-slate-200/60">
                      <span className="bg-slate-200/80 text-slate-700 px-1.5 py-0.2 rounded font-mono">
                        ±{loc.accuracyMeters}m ({loc.source.toUpperCase()})
                      </span>
                      {loc.batteryLevelPercent !== undefined && (
                        <span>Battery: {loc.batteryLevelPercent}%</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
