/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Pure business logic for PhoneFinder: location validation, freshness, status rules
 */

export interface RawLocationInput {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  timestamp: number; // Unix timestamp ms
  source: 'gps' | 'network' | 'integration' | 'ip_estimate';
}

export interface ValidatedLocation {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  timestamp: number;
  receivedAt: number;
  source: 'gps' | 'network' | 'integration' | 'ip_estimate';
  isIpEstimate: boolean;
}

export type FreshnessCategory = 'live' | 'recent' | 'last_known' | 'stale' | 'unknown';

export type DeviceStateCode =
  | 'ONLINE_FRESH'
  | 'ONLINE_NO_LOCATION'
  | 'OFFLINE_LAST_KNOWN'
  | 'OFFLINE_NO_LOCATION'
  | 'SWITCHED_OFF'
  | 'PERMISSION_DENIED'
  | 'SERVICES_DISABLED'
  | 'UNINSTALLED'
  | 'INTEGRATION_UNAVAILABLE';

/**
 * Validates coordinate inputs according to WGS84 bounds
 */
export function validateCoordinates(lat: unknown, lng: unknown): { valid: boolean; error?: string } {
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return { valid: false, error: 'Latitude and longitude must be numbers' };
  }
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { valid: false, error: 'Coordinates must be finite values' };
  }
  if (lat < -90 || lat > 90) {
    return { valid: false, error: 'Latitude must be between -90 and 90 degrees' };
  }
  if (lng < -180 || lng > 180) {
    return { valid: false, error: 'Longitude must be between -180 and 180 degrees' };
  }
  return { valid: true };
}

/**
 * Validates and sanitizes a location observation
 */
export function validateLocationRecord(
  input: RawLocationInput,
  serverReceivedAt: number = Date.now()
): { success: true; record: ValidatedLocation } | { success: false; error: string } {
  const coordCheck = validateCoordinates(input.latitude, input.longitude);
  if (!coordCheck.valid) {
    return { success: false, error: coordCheck.error || 'Invalid coordinates' };
  }

  // Accuracy validation
  let accuracy = input.accuracyMeters ?? 25;
  if (typeof accuracy !== 'number' || !Number.isFinite(accuracy) || accuracy < 0) {
    accuracy = 50; // Fallback sensible default
  }
  // Cap at realistic 50,000 meters
  if (accuracy > 50000) {
    accuracy = 50000;
  }

  // Timestamp checks: reject timestamps more than 10 minutes into the future
  if (input.timestamp > serverReceivedAt + 10 * 60 * 1000) {
    return { success: false, error: 'Observation timestamp cannot be in the future' };
  }

  // Reject timestamps older than 90 days
  if (input.timestamp < serverReceivedAt - 90 * 24 * 60 * 60 * 1000) {
    return { success: false, error: 'Observation timestamp is too old (exceeds 90 days retention)' };
  }

  return {
    success: true,
    record: {
      latitude: Number(input.latitude.toFixed(6)),
      longitude: Number(input.longitude.toFixed(6)),
      accuracyMeters: Math.round(accuracy),
      timestamp: input.timestamp,
      receivedAt: serverReceivedAt,
      source: input.source,
      isIpEstimate: input.source === 'ip_estimate',
    },
  };
}

/**
 * Categorizes how fresh a location report is
 */
export function calculateLocationFreshness(
  timestamp: number | null | undefined,
  now: number = Date.now()
): { category: FreshnessCategory; ageMinutes: number; label: string } {
  if (!timestamp || timestamp <= 0) {
    return { category: 'unknown', ageMinutes: Infinity, label: 'Location never recorded' };
  }

  const ageMs = Math.max(0, now - timestamp);
  const ageMinutes = Math.floor(ageMs / (60 * 1000));

  if (ageMinutes < 2) {
    return { category: 'live', ageMinutes, label: 'Live location (< 2 min ago)' };
  }
  if (ageMinutes < 15) {
    return { category: 'recent', ageMinutes, label: `Recently reported (${ageMinutes} min ago)` };
  }
  if (ageMinutes < 1440) {
    const hours = Math.floor(ageMinutes / 60);
    return { category: 'last_known', ageMinutes, label: `Last known (${hours}h ${ageMinutes % 60}m ago)` };
  }

  const days = Math.floor(ageMinutes / 1440);
  return { category: 'stale', ageMinutes, label: `Stale location (${days}d ago)` };
}

/**
 * Determines device overall state based on connectivity, permissions, battery, and location freshness
 */
export function determineDeviceState(params: {
  isOnline: boolean;
  permissionGranted: boolean;
  locationServicesEnabled: boolean;
  batteryLevelPercent?: number;
  lastReportedTimestamp?: number | null;
  hasLocationData: boolean;
  now?: number;
}): { code: DeviceStateCode; title: string; badgeColor: string; description: string } {
  const {
    isOnline,
    permissionGranted,
    locationServicesEnabled,
    batteryLevelPercent,
    lastReportedTimestamp,
    hasLocationData,
    now = Date.now(),
  } = params;

  if (!permissionGranted) {
    return {
      code: 'PERMISSION_DENIED',
      title: 'Location Permission Denied',
      badgeColor: 'amber',
      description: 'The companion app was denied location access by the OS.',
    };
  }

  if (!locationServicesEnabled) {
    return {
      code: 'SERVICES_DISABLED',
      title: 'Location Services Disabled',
      badgeColor: 'amber',
      description: 'Device-level GPS/location toggle is turned off.',
    };
  }

  if (batteryLevelPercent !== undefined && batteryLevelPercent <= 0) {
    return {
      code: 'SWITCHED_OFF',
      title: 'Switched Off / Depleted',
      badgeColor: 'gray',
      description: 'Device battery depleted or shut down. Showing last recorded state.',
    };
  }

  if (isOnline) {
    if (hasLocationData && lastReportedTimestamp) {
      const freshness = calculateLocationFreshness(lastReportedTimestamp, now);
      if (freshness.category === 'live' || freshness.category === 'recent') {
        return {
          code: 'ONLINE_FRESH',
          title: 'Online & Reporting',
          badgeColor: 'emerald',
          description: 'Device is actively connected and reporting fresh coordinates.',
        };
      }
    }
    return {
      code: 'ONLINE_NO_LOCATION',
      title: 'Online Without Fix',
      badgeColor: 'blue',
      description: 'Device is connected to network but has not acquired a GPS fix.',
    };
  }

  // Offline states
  if (hasLocationData) {
    return {
      code: 'OFFLINE_LAST_KNOWN',
      title: 'Offline (Last Known)',
      badgeColor: 'orange',
      description: 'Device is currently unreachable. Displaying last verified coordinate fix.',
    };
  }

  return {
    code: 'OFFLINE_NO_LOCATION',
    title: 'Offline (No Location)',
    badgeColor: 'rose',
    description: 'Device is offline and no previous location record exists.',
  };
}

/**
 * Filter history based on user privacy retention settings
 */
export function filterLocationHistoryByRetention<T extends { timestamp: number }>(
  records: T[],
  retentionDays: number,
  now: number = Date.now()
): T[] {
  if (retentionDays <= 0) return [];
  const cutoff = now - retentionDays * 24 * 60 * 60 * 1000;
  return records
    .filter((r) => r.timestamp >= cutoff)
    .sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Calculate distance in meters between two coordinates (Haversine formula)
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export interface GeofenceCheckParams {
  centerLatitude: number;
  centerLongitude: number;
  radiusMeters: number;
  enabled: boolean;
}

export interface GeofenceBreachResult {
  breached: boolean;
  distanceMeters: number;
  excessMeters: number;
  withinBoundary: boolean;
}

/**
 * Checks whether an observed coordinate violates a defined virtual perimeter
 */
export function checkGeofenceBreach(
  geofence: GeofenceCheckParams,
  observedLat: number,
  observedLng: number
): GeofenceBreachResult {
  if (!geofence.enabled || geofence.radiusMeters <= 0) {
    return {
      breached: false,
      distanceMeters: 0,
      excessMeters: 0,
      withinBoundary: true,
    };
  }

  const distance = calculateDistanceMeters(
    geofence.centerLatitude,
    geofence.centerLongitude,
    observedLat,
    observedLng
  );

  const breached = distance > geofence.radiusMeters;
  const excessMeters = Math.max(0, distance - geofence.radiusMeters);

  return {
    breached,
    distanceMeters: distance,
    excessMeters,
    withinBoundary: !breached,
  };
}
