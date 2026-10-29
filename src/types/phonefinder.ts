/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Comprehensive TypeScript types for PhoneFinder
 */

import { DeviceStateCode, FreshnessCategory } from '../utils/locationRules';

export type PlatformType = 'android' | 'ios' | 'web_companion';

export interface LocationRecord {
  id: string;
  deviceId: string;
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  timestamp: number;
  receivedAt: number;
  source: 'gps' | 'network' | 'integration' | 'ip_estimate';
  altitudeMeters?: number;
  speedMps?: number;
  batteryLevelPercent?: number;
  isCharging?: boolean;
  networkType?: 'wifi' | 'cellular' | 'none';
  addressName?: string;
  isSimulated?: boolean;
}

export interface GeofencePerimeter {
  id: string;
  deviceId: string;
  centerLatitude: number;
  centerLongitude: number;
  radiusMeters: number; // e.g. 50, 100, 250, 500, 1000
  enabled: boolean;
  name: string;
  createdAt: number;
  triggeredAt?: number;
  lastDistanceMeters?: number;
}

export interface RegisteredDevice {
  id: string;
  name: string;
  platform: PlatformType;
  model: string;
  osVersion: string;
  registeredAt: number;
  lastHeartbeatAt: number;
  isOnline: boolean;
  permissionGranted: boolean;
  locationServicesEnabled: boolean;
  batteryLevelPercent: number;
  isCharging: boolean;
  networkType: 'wifi' | 'cellular' | 'none';
  lastLocation?: LocationRecord;
  lostModeEnabled: boolean;
  lostModeMessage?: string;
  lostModeContactPhone?: string;
  alarmActive: boolean;
  alarmTriggeredAt?: number;
  deviceSecretHash?: string;
  geofence?: GeofencePerimeter;
}

export interface UserAccount {
  id: string;
  email: string;
  fullName: string;
  role: 'regular_user' | 'support_admin' | 'sys_admin';
  createdAt: number;
  isVerified: boolean;
  twoFactorEnabled: boolean;
}

export interface AlertNotification {
  id: string;
  deviceId?: string;
  deviceName?: string;
  type: 'status_change' | 'location_update' | 'permission_revoked' | 'battery_low' | 'lost_mode_viewed' | 'security_alert' | 'geofence_breach';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  severity: 'info' | 'warning' | 'critical';
}

export interface PrivacyPreferences {
  retentionDays: number; // 1, 7, 30, 90
  pauseLocationReporting: boolean;
  allowHighAccuracy: boolean;
  exportAuditLogs: boolean;
  notifyOnNewLocation: boolean;
  notifyOnDisconnect: boolean;
  notifyOnLowBattery: boolean;
}

export interface AuditEvent {
  id: string;
  timestamp: number;
  userId: string;
  action: string;
  category: 'auth' | 'device' | 'location' | 'recovery' | 'privacy';
  details: string;
  ipAddress: string;
  userAgent: string;
}

export interface OfficialPlatformGuidance {
  id: string;
  platform: 'android' | 'ios' | 'carrier';
  title: string;
  officialUrl: string;
  serviceName: string;
  keySteps: string[];
  limitations: string[];
}
