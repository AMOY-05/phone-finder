/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Interactive Leaflet Map Component with Accuracy Circles, Path Trails, and Tile Fallbacks
 */

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocationRecord, RegisteredDevice } from '../types/phonefinder';
import { calculateLocationFreshness } from '../utils/locationRules';
import { Layers, Maximize2, Navigation, AlertTriangle, ExternalLink } from 'lucide-react';

interface InteractiveMapProps {
  device?: RegisteredDevice;
  locations?: LocationRecord[];
  activeLocation?: LocationRecord | null;
  showTrail?: boolean;
  className?: string;
  onSelectLocation?: (loc: LocationRecord) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  device,
  locations = [],
  activeLocation,
  showTrail = false,
  className = 'h-96 w-full',
  onSelectLocation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const trailLayerRef = useRef<L.Polyline | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);

  const [mapTileStyle, setMapTileStyle] = useState<'osm' | 'topo' | 'hot'>('osm');
  const [mapError, setMapError] = useState<string | null>(null);

  // Pick target location to center on
  const targetLoc = activeLocation || device?.lastLocation || (locations.length > 0 ? locations[0] : null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      try {
        const initialLat = targetLoc?.latitude ?? 37.7749;
        const initialLng = targetLoc?.longitude ?? -122.4194;

        const map = L.map(mapContainerRef.current, {
          center: [initialLat, initialLng],
          zoom: targetLoc ? 16 : 13,
          zoomControl: false,
          attributionControl: true,
        });

        // Add custom zoom control in bottom right
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        const markersLayer = L.layerGroup().addTo(map);
        markersLayerRef.current = markersLayer;
        mapInstanceRef.current = map;
      } catch (err) {
        console.error('Error initializing map:', err);
        setMapError('Interactive map canvas could not be initialized.');
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    let attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    if (mapTileStyle === 'topo') {
      tileUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      attribution = '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>';
    } else if (mapTileStyle === 'hot') {
      tileUrl = 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';
      attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by Humanitarian OpenStreetMap Team';
    }

    const tileLayer = L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution,
    });

    tileLayer.addTo(map);
  }, [mapTileStyle]);

  // Update Markers, Accuracy Circle, and Trail
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    if (trailLayerRef.current) {
      map.removeLayer(trailLayerRef.current);
      trailLayerRef.current = null;
    }
    if (accuracyCircleRef.current) {
      map.removeLayer(accuracyCircleRef.current);
      accuracyCircleRef.current = null;
    }

    if (!targetLoc) {
      return;
    }

    // Set center
    map.setView([targetLoc.latitude, targetLoc.longitude], map.getZoom() || 16, { animate: true });

    // Accuracy Circle
    const accuracy = Math.max(targetLoc.accuracyMeters || 15, 5);
    const circle = L.circle([targetLoc.latitude, targetLoc.longitude], {
      radius: accuracy,
      color: '#2563eb',
      fillColor: '#3b82f6',
      fillOpacity: 0.15,
      weight: 1.5,
      dashArray: '4, 4',
    }).addTo(markersLayer);
    accuracyCircleRef.current = circle;

    // Virtual Perimeter (Geofence) Ring
    if (device?.geofence && device.geofence.enabled) {
      const geo = device.geofence;
      const isBreached = (geo.lastDistanceMeters || 0) > geo.radiusMeters;

      const geofenceCircle = L.circle([geo.centerLatitude, geo.centerLongitude], {
        radius: geo.radiusMeters,
        color: isBreached ? '#dc2626' : '#7c3aed',
        fillColor: isBreached ? '#ef4444' : '#8b5cf6',
        fillOpacity: isBreached ? 0.22 : 0.12,
        weight: 2,
        dashArray: isBreached ? '4, 4' : '8, 6',
      }).addTo(markersLayer);

      // Geofence Center Anchor Marker
      const anchorIcon = L.divIcon({
        html: `<div class="w-4 h-4 rounded-full ${
          isBreached ? 'bg-red-600' : 'bg-purple-600'
        } border-2 border-white shadow-md flex items-center justify-center text-[9px] text-white font-bold">⚓</div>`,
        className: 'geofence-anchor-pin',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      const anchorMarker = L.marker([geo.centerLatitude, geo.centerLongitude], {
        icon: anchorIcon,
      }).addTo(markersLayer);

      anchorMarker.bindPopup(`
        <div class="p-1 text-xs">
          <div class="font-bold text-slate-900">${geo.name}</div>
          <div class="text-slate-600">Perimeter Radius: <strong>${geo.radiusMeters}m</strong></div>
          <div class="text-[11px] ${isBreached ? 'text-red-600 font-bold' : 'text-emerald-600 font-semibold'}">
            ${isBreached ? `BREACHED (${geo.lastDistanceMeters}m from center)` : 'DEVICE WITHIN PERIMETER'}
          </div>
        </div>
      `);
    }

    // Freshness status
    const freshness = calculateLocationFreshness(targetLoc.timestamp);
    const isLive = freshness.category === 'live';

    // Custom pulse marker HTML
    const markerHtml = `
      <div class="relative flex items-center justify-center">
        ${
          isLive
            ? `<div class="absolute -inset-3 bg-blue-500 rounded-full animate-ping opacity-35"></div>
               <div class="absolute -inset-1.5 bg-blue-400 rounded-full animate-pulse opacity-50"></div>`
            : ''
        }
        <div class="w-9 h-9 rounded-full ${
          isLive ? 'bg-blue-600' : 'bg-slate-700'
        } border-2 border-white shadow-xl flex items-center justify-center text-white text-xs font-bold">
          ${
            device?.platform === 'ios'
              ? ''
              : device?.platform === 'android'
              ? '🤖'
              : '📍'
          }
        </div>
      </div>
    `;

    const customIcon = L.divIcon({
      html: markerHtml,
      className: 'custom-phone-pin',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const primaryMarker = L.marker([targetLoc.latitude, targetLoc.longitude], {
      icon: customIcon,
    }).addTo(markersLayer);

    const popupContent = `
      <div class="p-2 text-xs font-sans">
        <div class="font-bold text-slate-900 text-sm mb-1">${device?.name || 'Target Device'}</div>
        <div class="text-slate-600 mb-1"><strong>Coords:</strong> ${targetLoc.latitude.toFixed(6)}, ${targetLoc.longitude.toFixed(6)}</div>
        <div class="text-slate-600 mb-1"><strong>Accuracy:</strong> ±${targetLoc.accuracyMeters}m (${targetLoc.source.toUpperCase()})</div>
        <div class="text-slate-600 mb-1"><strong>Freshness:</strong> ${freshness.label}</div>
        ${targetLoc.addressName ? `<div class="text-slate-500 text-[11px] mt-1 border-t pt-1">${targetLoc.addressName}</div>` : ''}
      </div>
    `;
    primaryMarker.bindPopup(popupContent);

    // If showing history trail
    if (showTrail && locations.length > 1) {
      const sortedByTime = [...locations].sort((a, b) => a.timestamp - b.timestamp);
      const latLngs: [number, number][] = sortedByTime.map((loc) => [loc.latitude, loc.longitude]);

      const polyline = L.polyline(latLngs, {
        color: '#6366f1',
        weight: 3,
        opacity: 0.8,
        dashArray: '6, 6',
      }).addTo(map);

      trailLayerRef.current = polyline;

      // Add small waypoint nodes along the route
      sortedByTime.forEach((loc, idx) => {
        if (loc.id === targetLoc.id) return; // Skip primary target

        const waypointIcon = L.divIcon({
          html: `<div class="w-5 h-5 rounded-full bg-indigo-500 border border-white text-white text-[10px] flex items-center justify-center font-bold shadow-sm opacity-90">${idx + 1}</div>`,
          className: 'waypoint-pin',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        const waypointMarker = L.marker([loc.latitude, loc.longitude], { icon: waypointIcon }).addTo(markersLayer);
        waypointMarker.on('click', () => {
          if (onSelectLocation) onSelectLocation(loc);
        });
      });

      // Fit bounds to cover trail
      map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
    }
  }, [targetLoc, showTrail, locations, device]);

  const handleRecenter = () => {
    if (mapInstanceRef.current && targetLoc) {
      mapInstanceRef.current.setView([targetLoc.latitude, targetLoc.longitude], 16, { animate: true });
    }
  };

  const handleToggleFullscreen = () => {
    if (!mapContainerRef.current) return;
    if (!document.fullscreenElement) {
      mapContainerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  if (mapError || !targetLoc) {
    return (
      <div className={`relative flex flex-col items-center justify-center bg-slate-900 text-white rounded-xl border border-slate-800 p-8 text-center ${className}`}>
        <AlertTriangle className="w-12 h-12 text-amber-400 mb-3" />
        <h3 className="text-lg font-semibold mb-1">
          {!targetLoc ? 'No Location Fix Available' : 'Map Provider Offline'}
        </h3>
        <p className="text-sm text-slate-400 max-w-md mb-4">
          {!targetLoc
            ? 'This device has not yet reported GPS coordinates, or location permission is currently disabled on the phone.'
            : 'Using coordinate telemetry fallback. You can inspect raw telemetry or view coordinates in an external mapping service.'}
        </p>
        {targetLoc && (
          <div className="bg-slate-800/90 rounded-lg p-3 text-xs text-left font-mono mb-4 border border-slate-700">
            <div>Latitude: {targetLoc.latitude}</div>
            <div>Longitude: {targetLoc.longitude}</div>
            <div>Accuracy: ±{targetLoc.accuracyMeters}m ({targetLoc.source})</div>
            <div>Time: {new Date(targetLoc.timestamp).toLocaleTimeString()}</div>
          </div>
        )}
        {targetLoc && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${targetLoc.latitude},${targetLoc.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-medium text-white transition-colors"
          >
            <span>Open in Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    );
  }

  return (
    <div className={`relative rounded-xl overflow-hidden border border-slate-200 shadow-sm ${className}`}>
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Control Overlay: Top Right Tools */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
        {/* Layer style toggle */}
        <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-md border border-slate-200/80 p-1 flex gap-1">
          <button
            onClick={() => setMapTileStyle('osm')}
            className={`px-2.5 py-1 text-xs font-medium rounded ${
              mapTileStyle === 'osm' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Standard OSM
          </button>
          <button
            onClick={() => setMapTileStyle('hot')}
            className={`px-2.5 py-1 text-xs font-medium rounded ${
              mapTileStyle === 'hot' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Humanitarian
          </button>
          <button
            onClick={() => setMapTileStyle('topo')}
            className={`px-2.5 py-1 text-xs font-medium rounded ${
              mapTileStyle === 'topo' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Topographic
          </button>
        </div>

        {/* Recenter button */}
        <button
          onClick={handleRecenter}
          title="Recenter on Device"
          className="bg-white/95 backdrop-blur-md hover:bg-white text-slate-700 p-2 rounded-lg shadow-md border border-slate-200/80 flex items-center justify-center transition-all hover:scale-105"
        >
          <Navigation className="w-4 h-4 text-blue-600" />
        </button>

        {/* Fullscreen button */}
        <button
          onClick={handleToggleFullscreen}
          title="Toggle Fullscreen"
          className="bg-white/95 backdrop-blur-md hover:bg-white text-slate-700 p-2 rounded-lg shadow-md border border-slate-200/80 flex items-center justify-center transition-all hover:scale-105"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Status Card Bottom Left */}
      <div className="absolute bottom-3 left-3 z-10 bg-slate-900/90 backdrop-blur-md text-white p-3 rounded-lg shadow-lg border border-slate-700/60 max-w-xs text-xs">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="font-semibold text-slate-100 truncate">{device?.name || 'Observed Coordinates'}</span>
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase ${
              targetLoc.source === 'gps'
                ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-600'
                : targetLoc.source === 'ip_estimate'
                ? 'bg-amber-900/80 text-amber-300 border border-amber-600'
                : 'bg-blue-900/80 text-blue-300 border border-blue-600'
            }`}
          >
            {targetLoc.source === 'ip_estimate' ? 'IP Estimate' : targetLoc.source.toUpperCase()}
          </span>
        </div>
        <div className="text-slate-300 font-mono text-[11px] mb-1">
          {targetLoc.latitude.toFixed(5)}, {targetLoc.longitude.toFixed(5)} (±{targetLoc.accuracyMeters}m)
        </div>
        <div className="text-slate-400 text-[10px] flex items-center justify-between">
          <span>Observed: {new Date(targetLoc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          <span className="text-blue-400 font-medium">{calculateLocationFreshness(targetLoc.timestamp).label}</span>
        </div>
      </div>
    </div>
  );
};
