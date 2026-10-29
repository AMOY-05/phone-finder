/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Unit tests for PhoneFinder location rules
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateCoordinates,
  validateLocationRecord,
  calculateLocationFreshness,
  determineDeviceState,
  filterLocationHistoryByRetention,
  calculateDistanceMeters,
  checkGeofenceBreach,
} from './locationRules.ts';

test('validateCoordinates: accepts valid WGS84 coordinates', () => {
  const result = validateCoordinates(37.7749, -122.4194);
  assert.equal(result.valid, true);
});

test('validateCoordinates: rejects out of range latitude/longitude', () => {
  assert.equal(validateCoordinates(95.0, 10.0).valid, false);
  assert.equal(validateCoordinates(-91.0, 10.0).valid, false);
  assert.equal(validateCoordinates(10.0, 185.0).valid, false);
  assert.equal(validateCoordinates(10.0, -181.0).valid, false);
  assert.equal(validateCoordinates(NaN, 10.0).valid, false);
});

test('validateLocationRecord: handles valid payload and sanitizes precision', () => {
  const now = 1700000000000;
  const res = validateLocationRecord(
    {
      latitude: 40.712776543,
      longitude: -74.005974321,
      accuracyMeters: 12.3,
      timestamp: now - 30000,
      source: 'gps',
    },
    now
  );

  assert.equal(res.success, true);
  if (res.success) {
    assert.equal(res.record.latitude, 40.712777);
    assert.equal(res.record.longitude, -74.005974);
    assert.equal(res.record.accuracyMeters, 12);
    assert.equal(res.record.isIpEstimate, false);
  }
});

test('validateLocationRecord: flags IP-derived estimate explicitly', () => {
  const now = 1700000000000;
  const res = validateLocationRecord(
    {
      latitude: 51.5074,
      longitude: -0.1278,
      accuracyMeters: 2500,
      timestamp: now,
      source: 'ip_estimate',
    },
    now
  );

  assert.equal(res.success, true);
  if (res.success) {
    assert.equal(res.record.isIpEstimate, true);
    assert.equal(res.record.source, 'ip_estimate');
  }
});

test('validateLocationRecord: rejects future observation timestamps', () => {
  const now = 1700000000000;
  const res = validateLocationRecord(
    {
      latitude: 37.7749,
      longitude: -122.4194,
      timestamp: now + 15 * 60 * 1000, // 15 mins in future
      source: 'gps',
    },
    now
  );
  assert.equal(res.success, false);
});

test('calculateLocationFreshness: correctly categorizes age thresholds', () => {
  const now = 1700000000000;
  // Under 2 mins: live
  const live = calculateLocationFreshness(now - 60 * 1000, now);
  assert.equal(live.category, 'live');

  // 10 mins: recent
  const recent = calculateLocationFreshness(now - 10 * 60 * 1000, now);
  assert.equal(recent.category, 'recent');

  // 3 hours: last_known
  const lastKnown = calculateLocationFreshness(now - 3 * 3600 * 1000, now);
  assert.equal(lastKnown.category, 'last_known');

  // 3 days: stale
  const stale = calculateLocationFreshness(now - 3 * 24 * 3600 * 1000, now);
  assert.equal(stale.category, 'stale');

  // null: unknown
  const unknown = calculateLocationFreshness(null, now);
  assert.equal(unknown.category, 'unknown');
});

test('determineDeviceState: prioritizes permission denied and power depletion', () => {
  const permDenied = determineDeviceState({
    isOnline: true,
    permissionGranted: false,
    locationServicesEnabled: true,
    hasLocationData: true,
  });
  assert.equal(permDenied.code, 'PERMISSION_DENIED');

  const depleted = determineDeviceState({
    isOnline: false,
    permissionGranted: true,
    locationServicesEnabled: true,
    batteryLevelPercent: 0,
    hasLocationData: true,
  });
  assert.equal(depleted.code, 'SWITCHED_OFF');
});

test('determineDeviceState: distinguishes online fresh vs offline last known', () => {
  const now = 1700000000000;
  const onlineFresh = determineDeviceState({
    isOnline: true,
    permissionGranted: true,
    locationServicesEnabled: true,
    batteryLevelPercent: 85,
    lastReportedTimestamp: now - 30 * 1000, // 30s ago
    hasLocationData: true,
    now,
  });
  assert.equal(onlineFresh.code, 'ONLINE_FRESH');

  const offlineKnown = determineDeviceState({
    isOnline: false,
    permissionGranted: true,
    locationServicesEnabled: true,
    batteryLevelPercent: 40,
    lastReportedTimestamp: now - 2 * 3600 * 1000,
    hasLocationData: true,
    now,
  });
  assert.equal(offlineKnown.code, 'OFFLINE_LAST_KNOWN');
});

test('filterLocationHistoryByRetention: filters out records beyond retention policy', () => {
  const now = 1700000000000;
  const oneDay = 24 * 60 * 60 * 1000;
  const records = [
    { id: '1', timestamp: now - 0.5 * oneDay }, // 12h ago
    { id: '2', timestamp: now - 2 * oneDay },   // 2 days ago
    { id: '3', timestamp: now - 8 * oneDay },   // 8 days ago
  ];

  // Retention of 7 days
  const filtered7d = filterLocationHistoryByRetention(records, 7, now);
  assert.equal(filtered7d.length, 2);
  assert.equal(filtered7d[0].id, '1');
  assert.equal(filtered7d[1].id, '2');

  // Retention of 1 day
  const filtered1d = filterLocationHistoryByRetention(records, 1, now);
  assert.equal(filtered1d.length, 1);
  assert.equal(filtered1d[0].id, '1');
});

test('calculateDistanceMeters: computes accurate approximate distance', () => {
  // Distance between Eiffel Tower (48.8584, 2.2945) and Arc de Triomphe (48.8738, 2.2950) is ~1.7km
  const dist = calculateDistanceMeters(48.8584, 2.2945, 48.8738, 2.295);
  assert.ok(dist >= 1600 && dist <= 1800, `Expected ~1700m, got ${dist}`);
});

test('checkGeofenceBreach: identifies coordinates within safe perimeter', () => {
  const centerLat = 37.774929;
  const centerLng = -122.419416;
  const geofence = {
    centerLatitude: centerLat,
    centerLongitude: centerLng,
    radiusMeters: 200,
    enabled: true,
  };

  // 30 meters away
  const inside = checkGeofenceBreach(geofence, 37.7751, -122.4194);
  assert.equal(inside.breached, false);
  assert.equal(inside.withinBoundary, true);
  assert.equal(inside.excessMeters, 0);
  assert.ok(inside.distanceMeters < 200);
});

test('checkGeofenceBreach: detects perimeter breach when device moves beyond radius', () => {
  const centerLat = 37.774929;
  const centerLng = -122.419416;
  const geofence = {
    centerLatitude: centerLat,
    centerLongitude: centerLng,
    radiusMeters: 100, // 100 meters
    enabled: true,
  };

  // Point ~400 meters away
  const outside = checkGeofenceBreach(geofence, 37.7785, -122.4194);
  assert.equal(outside.breached, true);
  assert.equal(outside.withinBoundary, false);
  assert.ok(outside.distanceMeters > 100);
  assert.ok(outside.excessMeters > 0);
});

test('checkGeofenceBreach: ignores movement if geofence is disabled', () => {
  const centerLat = 37.774929;
  const centerLng = -122.419416;
  const geofence = {
    centerLatitude: centerLat,
    centerLongitude: centerLng,
    radiusMeters: 100,
    enabled: false,
  };

  const res = checkGeofenceBreach(geofence, 37.8000, -122.4000);
  assert.equal(res.breached, false);
  assert.equal(res.withinBoundary, true);
});
