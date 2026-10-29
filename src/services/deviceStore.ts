/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * State management and device operations for PhoneFinder
 */

import {
  RegisteredDevice,
  LocationRecord,
  UserAccount,
  AlertNotification,
  PrivacyPreferences,
  AuditEvent,
} from '../types/phonefinder';
import {
  validateLocationRecord,
  calculateLocationFreshness,
  determineDeviceState,
  filterLocationHistoryByRetention,
  checkGeofenceBreach,
  DeviceStateCode,
} from '../utils/locationRules';

const STORAGE_KEYS = {
  USER: 'phonefinder_user',
  DEVICES: 'phonefinder_devices',
  LOCATIONS: 'phonefinder_locations',
  NOTIFICATIONS: 'phonefinder_notifications',
  PRIVACY: 'phonefinder_privacy',
  AUDIT: 'phonefinder_audit',
  INITIALIZED: 'phonefinder_clean_prod_v1',
};

function getNow(): number {
  return Date.now();
}

export function createInitialSeedData(): {
  user: UserAccount;
  devices: RegisteredDevice[];
  locations: LocationRecord[];
  notifications: AlertNotification[];
  privacy: PrivacyPreferences;
  audit: AuditEvent[];
} {
  const now = getNow();
  const user: UserAccount = {
    id: 'usr_sec_98214',
    email: 'alex.morgan@example.com',
    fullName: 'Alex Morgan',
    role: 'regular_user',
    createdAt: now,
    isVerified: true,
    twoFactorEnabled: true,
  };

  const devices: RegisteredDevice[] = [];
  const locations: LocationRecord[] = [];
  const notifications: AlertNotification[] = [];

  const privacy: PrivacyPreferences = {
    retentionDays: 30,
    pauseLocationReporting: false,
    allowHighAccuracy: true,
    exportAuditLogs: true,
    notifyOnNewLocation: true,
    notifyOnDisconnect: true,
    notifyOnLowBattery: true,
  };

  const audit: AuditEvent[] = [
    {
      id: 'aud_init_001',
      timestamp: now,
      userId: user.id,
      action: 'SYSTEM_INITIALIZED',
      category: 'privacy',
      details: 'Clean PhoneFinder production sentinel initialized. Ready for device registration.',
      ipAddress: '198.51.100.24',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 80) : 'Browser Client',
    },
  ];

  return { user, devices, locations, notifications, privacy, audit };
}

class DeviceStore {
  private user: UserAccount;
  private devices: RegisteredDevice[] = [];
  private locations: LocationRecord[] = [];
  private notifications: AlertNotification[] = [];
  private privacy: PrivacyPreferences;
  private audit: AuditEvent[] = [];
  private audioContext: AudioContext | null = null;
  private activeOscillators: { osc1: OscillatorNode; osc2: OscillatorNode; gain: GainNode } | null = null;
  private listeners: Set<() => void> = new Set();

  constructor() {
    const initialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    if (!initialized || initialized !== STORAGE_KEYS.INITIALIZED) {
      localStorage.clear();
      const seed = createInitialSeedData();
      this.user = seed.user;
      this.devices = seed.devices;
      this.locations = seed.locations;
      this.notifications = seed.notifications;
      this.privacy = seed.privacy;
      this.audit = seed.audit;
      this.persistAll();
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, STORAGE_KEYS.INITIALIZED);
    } else {
      this.user = this.load(STORAGE_KEYS.USER, createInitialSeedData().user);
      this.devices = this.load(STORAGE_KEYS.DEVICES, createInitialSeedData().devices);
      this.locations = this.load(STORAGE_KEYS.LOCATIONS, createInitialSeedData().locations);
      this.notifications = this.load(STORAGE_KEYS.NOTIFICATIONS, createInitialSeedData().notifications);
      this.privacy = this.load(STORAGE_KEYS.PRIVACY, createInitialSeedData().privacy);
      this.audit = this.load(STORAGE_KEYS.AUDIT, createInitialSeedData().audit);
    }
  }

  private load<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  private persist(key: string, data: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('Storage persist failed', e);
    }
  }

  private persistAll() {
    this.persist(STORAGE_KEYS.USER, this.user);
    this.persist(STORAGE_KEYS.DEVICES, this.devices);
    this.persist(STORAGE_KEYS.LOCATIONS, this.locations);
    this.persist(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    this.persist(STORAGE_KEYS.PRIVACY, this.privacy);
    this.persist(STORAGE_KEYS.AUDIT, this.audit);
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Getters
  public getUser(): UserAccount {
    return this.user;
  }

  public getDevices(): RegisteredDevice[] {
    return this.devices;
  }

  public getDeviceById(id: string): RegisteredDevice | undefined {
    return this.devices.find((d) => d.id === id);
  }

  public getLocationsForDevice(deviceId: string): LocationRecord[] {
    const raw = this.locations.filter((l) => l.deviceId === deviceId);
    return filterLocationHistoryByRetention(raw, this.privacy.retentionDays);
  }

  public getNotifications(): AlertNotification[] {
    return this.notifications.sort((a, b) => b.timestamp - a.timestamp);
  }

  public getPrivacy(): PrivacyPreferences {
    return this.privacy;
  }

  public getAuditTrail(): AuditEvent[] {
    return this.audit.sort((a, b) => b.timestamp - a.timestamp);
  }

  // Actions
  public registerDevice(device: {
    name: string;
    platform: 'android' | 'ios' | 'web_companion';
    model: string;
    osVersion: string;
    batteryLevel?: number;
    initialCoords?: { latitude: number; longitude: number; accuracy: number };
  }): RegisteredDevice {
    const now = getNow();
    const id = `dev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    let initialLocation: LocationRecord | undefined = undefined;
    if (device.initialCoords) {
      const validRes = validateLocationRecord({
        latitude: device.initialCoords.latitude,
        longitude: device.initialCoords.longitude,
        accuracyMeters: device.initialCoords.accuracy,
        timestamp: now,
        source: 'gps',
      });

      if (validRes.success) {
        initialLocation = {
          id: `loc_${now}_${Math.random().toString(36).substring(2, 6)}`,
          deviceId: id,
          latitude: validRes.record.latitude,
          longitude: validRes.record.longitude,
          accuracyMeters: validRes.record.accuracyMeters,
          timestamp: validRes.record.timestamp,
          receivedAt: validRes.record.receivedAt,
          source: validRes.record.source,
          batteryLevelPercent: device.batteryLevel ?? 88,
          isCharging: false,
          networkType: 'wifi',
          addressName: 'Current Observed Location',
          isSimulated: false,
        };
        this.locations.push(initialLocation);
        this.persist(STORAGE_KEYS.LOCATIONS, this.locations);
      }
    }

    const newDevice: RegisteredDevice = {
      id,
      name: device.name.trim(),
      platform: device.platform,
      model: device.model || (device.platform === 'ios' ? 'Apple Device' : 'Android Smartphone'),
      osVersion: device.osVersion || 'Unknown OS',
      registeredAt: now,
      lastHeartbeatAt: now,
      isOnline: true,
      permissionGranted: true,
      locationServicesEnabled: true,
      batteryLevelPercent: device.batteryLevel ?? 90,
      isCharging: false,
      networkType: 'wifi',
      lastLocation: initialLocation,
      lostModeEnabled: false,
      alarmActive: false,
    };

    this.devices.push(newDevice);
    this.addAuditEvent('DEVICE_REGISTERED', 'device', `Registered device: ${newDevice.name} (${newDevice.platform})`);
    this.addNotification({
      deviceId: id,
      deviceName: newDevice.name,
      type: 'status_change',
      title: 'New Device Registered',
      message: `${newDevice.name} was successfully registered to your PhoneFinder account.`,
      severity: 'info',
    });

    this.persist(STORAGE_KEYS.DEVICES, this.devices);
    this.notify();
    return newDevice;
  }

  public deregisterDevice(deviceId: string): boolean {
    const dev = this.getDeviceById(deviceId);
    if (!dev) return false;

    this.stopRemoteAlarm();
    this.devices = this.devices.filter((d) => d.id !== deviceId);
    this.locations = this.locations.filter((l) => l.deviceId !== deviceId);
    this.persist(STORAGE_KEYS.DEVICES, this.devices);
    this.persist(STORAGE_KEYS.LOCATIONS, this.locations);

    this.addAuditEvent('DEVICE_REVOKED', 'device', `Deregistered device: ${dev.name} and purged device telemetry.`);
    this.notify();
    return true;
  }

  public reportLocation(
    deviceId: string,
    coords: {
      latitude: number;
      longitude: number;
      accuracyMeters?: number;
      source?: 'gps' | 'network' | 'integration' | 'ip_estimate';
      batteryLevelPercent?: number;
      isCharging?: boolean;
      networkType?: 'wifi' | 'cellular' | 'none';
      addressName?: string;
      isSimulated?: boolean;
    }
  ): { success: boolean; error?: string; record?: LocationRecord } {
    if (this.privacy.pauseLocationReporting) {
      return { success: false, error: 'Location reporting is currently paused in Privacy Settings.' };
    }

    const dev = this.getDeviceById(deviceId);
    if (!dev) {
      return { success: false, error: 'Device not found or not authorized' };
    }

    const now = getNow();
    const validation = validateLocationRecord(
      {
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracyMeters: coords.accuracyMeters,
        timestamp: now,
        source: coords.source || 'gps',
      },
      now
    );

    if (!validation.success) {
      return { success: false, error: validation.error };
    }

    const record: LocationRecord = {
      id: `loc_${now}_${Math.random().toString(36).substring(2, 6)}`,
      deviceId,
      latitude: validation.record.latitude,
      longitude: validation.record.longitude,
      accuracyMeters: validation.record.accuracyMeters,
      timestamp: validation.record.timestamp,
      receivedAt: validation.record.receivedAt,
      source: validation.record.source,
      batteryLevelPercent: coords.batteryLevelPercent ?? dev.batteryLevelPercent,
      isCharging: coords.isCharging ?? dev.isCharging,
      networkType: coords.networkType ?? dev.networkType,
      addressName: coords.addressName || 'Reported Location',
      isSimulated: coords.isSimulated ?? false,
    };

    this.locations.push(record);
    dev.lastLocation = record;
    dev.lastHeartbeatAt = now;
    dev.isOnline = true;
    dev.permissionGranted = true;
    dev.locationServicesEnabled = true;
    if (coords.batteryLevelPercent !== undefined) {
      dev.batteryLevelPercent = coords.batteryLevelPercent;
    }

    this.persist(STORAGE_KEYS.LOCATIONS, this.locations);
    this.persist(STORAGE_KEYS.DEVICES, this.devices);

    // Virtual Perimeter (Geofence) Evaluation
    if (dev.geofence && dev.geofence.enabled) {
      const breachCheck = checkGeofenceBreach(
        dev.geofence,
        record.latitude,
        record.longitude
      );
      dev.geofence.lastDistanceMeters = breachCheck.distanceMeters;

      if (breachCheck.breached) {
        dev.geofence.triggeredAt = now;
        this.addNotification({
          deviceId,
          deviceName: dev.name,
          type: 'geofence_breach',
          title: 'VIRTUAL PERIMETER BREACH',
          message: `${dev.name} has moved outside the ${dev.geofence.radiusMeters}m perimeter! Current distance is ${breachCheck.distanceMeters}m (${breachCheck.excessMeters}m beyond radius).`,
          severity: 'critical',
        });
        this.addAuditEvent(
          'GEOFENCE_BREACH_DETECTED',
          'recovery',
          `${dev.name} breached virtual perimeter (${dev.geofence.radiusMeters}m). Observed distance: ${breachCheck.distanceMeters}m.`
        );
      }
    }

    if (this.privacy.notifyOnNewLocation) {
      this.addNotification({
        deviceId,
        deviceName: dev.name,
        type: 'location_update',
        title: 'New Location Fix',
        message: `${dev.name} reported a fresh coordinates fix (accuracy ±${record.accuracyMeters}m).`,
        severity: 'info',
      });
    }

    this.addAuditEvent('LOCATION_INGESTED', 'location', `Ingested location for ${dev.name}: ${record.latitude}, ${record.longitude}`);
    this.persist(STORAGE_KEYS.DEVICES, this.devices);
    this.notify();
    return { success: true, record };
  }

  public setDeviceGeofence(
    deviceId: string,
    config: {
      radiusMeters: number;
      name?: string;
      enabled?: boolean;
      centerLat?: number;
      centerLng?: number;
    }
  ): boolean {
    const dev = this.getDeviceById(deviceId);
    if (!dev) return false;

    const centerLat = config.centerLat ?? dev.lastLocation?.latitude ?? 37.774929;
    const centerLng = config.centerLng ?? dev.lastLocation?.longitude ?? -122.419416;

    dev.geofence = {
      id: dev.geofence?.id || `geo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      deviceId,
      centerLatitude: centerLat,
      centerLongitude: centerLng,
      radiusMeters: Math.max(20, config.radiusMeters),
      enabled: config.enabled !== undefined ? config.enabled : true,
      name: config.name || `${dev.name} Perimeter`,
      createdAt: dev.geofence?.createdAt || getNow(),
      lastDistanceMeters: 0,
    };

    this.addAuditEvent(
      'GEOFENCE_CONFIGURED',
      'recovery',
      `Configured ${dev.geofence.radiusMeters}m virtual perimeter around ${dev.name} (${centerLat.toFixed(5)}, ${centerLng.toFixed(5)}).`
    );

    this.addNotification({
      deviceId,
      deviceName: dev.name,
      type: 'status_change',
      title: 'Virtual Perimeter Armed',
      message: `A ${dev.geofence.radiusMeters}m virtual perimeter has been set around ${dev.name}'s last known location.`,
      severity: 'info',
    });

    this.persist(STORAGE_KEYS.DEVICES, this.devices);
    this.notify();
    return true;
  }

  public toggleDeviceGeofence(deviceId: string, enabled: boolean): boolean {
    const dev = this.getDeviceById(deviceId);
    if (!dev || !dev.geofence) return false;

    dev.geofence.enabled = enabled;
    this.addAuditEvent(
      enabled ? 'GEOFENCE_ARMED' : 'GEOFENCE_DISARMED',
      'recovery',
      `${enabled ? 'Armed' : 'Disarmed'} virtual perimeter on ${dev.name}.`
    );
    this.persist(STORAGE_KEYS.DEVICES, this.devices);
    this.notify();
    return true;
  }

  public removeDeviceGeofence(deviceId: string): boolean {
    const dev = this.getDeviceById(deviceId);
    if (!dev) return false;

    delete dev.geofence;
    this.addAuditEvent('GEOFENCE_REMOVED', 'recovery', `Removed virtual perimeter on ${dev.name}.`);
    this.persist(STORAGE_KEYS.DEVICES, this.devices);
    this.notify();
    return true;
  }

  public simulateGeofenceMovement(deviceId: string, breach: boolean) {
    const dev = this.getDeviceById(deviceId);
    if (!dev || !dev.lastLocation) return;

    const baseLat = dev.geofence?.centerLatitude || dev.lastLocation.latitude;
    const baseLng = dev.geofence?.centerLongitude || dev.lastLocation.longitude;
    const radius = dev.geofence?.radiusMeters || 200;

    // If breach: move roughly 1.8x the radius (e.g. 200m radius -> ~360m jump)
    // 1 deg latitude is ~111,000 meters. 360m is ~0.0032 deg.
    const distanceTargetMeters = breach ? radius * 1.7 : radius * 0.4;
    const offsetDegrees = distanceTargetMeters / 111000;

    const newLat = baseLat + offsetDegrees;
    const newLng = baseLng + (offsetDegrees * 0.5);

    this.reportLocation(deviceId, {
      latitude: newLat,
      longitude: newLng,
      accuracyMeters: 8,
      source: 'gps',
      batteryLevelPercent: Math.max(1, dev.batteryLevelPercent - 1),
      addressName: breach ? 'Outside Virtual Perimeter' : 'Inside Safe Perimeter',
      isSimulated: true,
    });
  }

  public updateDeviceState(
    deviceId: string,
    updates: Partial<Pick<RegisteredDevice, 'isOnline' | 'permissionGranted' | 'locationServicesEnabled' | 'batteryLevelPercent' | 'networkType'>>
  ) {
    const dev = this.getDeviceById(deviceId);
    if (!dev) return;

    Object.assign(dev, updates);
    this.persist(STORAGE_KEYS.DEVICES, this.devices);
    this.notify();
  }

  public toggleLostMode(
    deviceId: string,
    enabled: boolean,
    message?: string,
    contactPhone?: string
  ) {
    const dev = this.getDeviceById(deviceId);
    if (!dev) return;

    dev.lostModeEnabled = enabled;
    if (enabled) {
      dev.lostModeMessage = message || 'This phone is lost. Please return to owner.';
      dev.lostModeContactPhone = contactPhone || '';
      this.addNotification({
        deviceId,
        deviceName: dev.name,
        type: 'lost_mode_viewed',
        title: 'Lost Mode Activated',
        message: `Lost mode armed for ${dev.name}. Contact information configured on lock display.`,
        severity: 'warning',
      });
      this.addAuditEvent('LOST_MODE_ENABLED', 'recovery', `Armed Lost Mode on ${dev.name}. Contact: ${contactPhone}`);
    } else {
      this.addAuditEvent('LOST_MODE_DISABLED', 'recovery', `Disarmed Lost Mode on ${dev.name}.`);
    }

    this.persist(STORAGE_KEYS.DEVICES, this.devices);
    this.notify();
  }

  public triggerRemoteAlarm(deviceId: string) {
    const dev = this.getDeviceById(deviceId);
    if (!dev) return;

    dev.alarmActive = true;
    dev.alarmTriggeredAt = getNow();
    this.persist(STORAGE_KEYS.DEVICES, this.devices);

    // Play synthetic siren audio using Web Audio API
    this.playSirenTone();

    this.addNotification({
      deviceId,
      deviceName: dev.name,
      type: 'status_change',
      title: 'Remote Ring Triggered',
      message: `Remote siren alarm sounded on ${dev.name} at maximum speaker volume.`,
      severity: 'warning',
    });
    this.addAuditEvent('REMOTE_RING_ACTIVATED', 'recovery', `Triggered remote ring alarm on ${dev.name}.`);
    this.notify();
  }

  public stopRemoteAlarm(deviceId?: string) {
    if (deviceId) {
      const dev = this.getDeviceById(deviceId);
      if (dev) {
        dev.alarmActive = false;
        this.persist(STORAGE_KEYS.DEVICES, this.devices);
      }
    } else {
      this.devices.forEach((d) => (d.alarmActive = false));
      this.persist(STORAGE_KEYS.DEVICES, this.devices);
    }

    this.stopSirenTone();
    this.notify();
  }

  private playSirenTone() {
    try {
      if (!this.audioContext) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.audioContext = new AudioCtx();
      }

      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      this.stopSirenTone();

      const osc1 = this.audioContext.createOscillator();
      const osc2 = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sine';

      // Modulate frequency to create European emergency siren pattern (700Hz - 950Hz)
      const now = this.audioContext.currentTime;
      osc1.frequency.setValueAtTime(700, now);
      osc2.frequency.setValueAtTime(950, now);

      for (let i = 0; i < 20; i++) {
        const t = now + i * 0.7;
        osc1.frequency.setValueAtTime(750, t);
        osc1.frequency.linearRampToValueAtTime(980, t + 0.35);
        osc1.frequency.linearRampToValueAtTime(750, t + 0.7);

        osc2.frequency.setValueAtTime(980, t);
        osc2.frequency.linearRampToValueAtTime(750, t + 0.35);
        osc2.frequency.linearRampToValueAtTime(980, t + 0.7);
      }

      gain.gain.setValueAtTime(0.15, now);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.audioContext.destination);

      osc1.start();
      osc2.start();

      this.activeOscillators = { osc1, osc2, gain };
    } catch (e) {
      console.warn('Web Audio siren tone could not start', e);
    }
  }

  private stopSirenTone() {
    if (this.activeOscillators) {
      try {
        this.activeOscillators.osc1.stop();
        this.activeOscillators.osc2.stop();
        this.activeOscillators.osc1.disconnect();
        this.activeOscillators.osc2.disconnect();
        this.activeOscillators.gain.disconnect();
      } catch {
        // Ignored
      }
      this.activeOscillators = null;
    }
  }

  public markNotificationAsRead(id: string) {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      this.persist(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
      this.notify();
    }
  }

  public markAllNotificationsAsRead() {
    this.notifications.forEach((n) => (n.read = true));
    this.persist(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    this.notify();
  }

  public updatePrivacy(updates: Partial<PrivacyPreferences>) {
    this.privacy = { ...this.privacy, ...updates };
    this.persist(STORAGE_KEYS.PRIVACY, this.privacy);
    this.addAuditEvent('PRIVACY_UPDATED', 'privacy', `Updated privacy settings: retention ${this.privacy.retentionDays}d, paused: ${this.privacy.pauseLocationReporting}`);
    this.notify();
  }

  public addAuditEvent(action: string, category: AuditEvent['category'], details: string) {
    const evt: AuditEvent = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: getNow(),
      userId: this.user.id,
      action,
      category,
      details,
      ipAddress: '198.51.100.24',
      userAgent: navigator.userAgent.substring(0, 100),
    };
    this.audit.unshift(evt);
    if (this.audit.length > 50) this.audit.pop();
    this.persist(STORAGE_KEYS.AUDIT, this.audit);
  }

  public addNotification(data: Omit<AlertNotification, 'id' | 'timestamp' | 'read'>) {
    const notif: AlertNotification = {
      ...data,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: getNow(),
      read: false,
    };
    this.notifications.unshift(notif);
    if (this.notifications.length > 50) this.notifications.pop();
    this.persist(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    this.notify();
  }

  public exportUserDataPackage(): string {
    const bundle = {
      exportedAt: new Date().toISOString(),
      user: this.user,
      devices: this.devices,
      locations: this.locations,
      notifications: this.notifications,
      privacy: this.privacy,
      audit: this.audit,
    };
    this.addAuditEvent('DATA_EXPORTED', 'privacy', 'Exported complete GDPR data package.');
    return JSON.stringify(bundle, null, 2);
  }

  public resetAllToSeed() {
    localStorage.clear();
    const seed = createInitialSeedData();
    this.user = seed.user;
    this.devices = seed.devices;
    this.locations = seed.locations;
    this.notifications = seed.notifications;
    this.privacy = seed.privacy;
    this.audit = seed.audit;
    this.stopSirenTone();
    this.persistAll();
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    this.notify();
  }
}

export const deviceStore = new DeviceStore();
