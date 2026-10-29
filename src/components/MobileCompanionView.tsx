/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Mobile Companion Testbed, Native Architecture, and Offline Research Module
 */

import React, { useState } from 'react';
import {
  FileCode,
  Radio,
  Smartphone,
  Navigation,
  Send,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Layers,
  Cpu,
  ShieldCheck,
  Download,
} from 'lucide-react';
import { RegisteredDevice } from '../types/phonefinder';

interface MobileCompanionViewProps {
  devices: RegisteredDevice[];
  onReportLocation: (
    deviceId: string,
    coords: {
      latitude: number;
      longitude: number;
      accuracyMeters: number;
      source: 'gps' | 'network' | 'integration' | 'ip_estimate';
      batteryLevelPercent?: number;
      addressName?: string;
    }
  ) => { success: boolean; error?: string };
  onRegisterBrowserDevice: (coords?: { latitude: number; longitude: number; accuracy: number }) => void;
}

export const MobileCompanionView: React.FC<MobileCompanionViewProps> = ({
  devices,
  onReportLocation,
  onRegisterBrowserDevice,
}) => {
  const [activeCodeTab, setActiveCodeTab] = useState<'flutter' | 'android' | 'ios' | 'api' | 'offline_research'>('flutter');

  // Live Browser GPS test state
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoResult, setGeoResult] = useState<string | null>(null);

  // Custom coordinate test form
  const [targetDeviceId, setTargetDeviceId] = useState(devices[0]?.id || '');
  const [testLat, setTestLat] = useState('37.774929');
  const [testLng, setTestLng] = useState('-122.419416');
  const [testAccuracy, setTestAccuracy] = useState('8');
  const [testBattery, setTestBattery] = useState('88');
  const [testSource, setTestSource] = useState<'gps' | 'network' | 'ip_estimate'>('gps');
  const [reportFeedback, setReportFeedback] = useState<{ success: boolean; msg: string } | null>(null);

  const handleCaptureRealGeolocation = () => {
    if (!navigator.geolocation) {
      setGeoResult('Browser Geolocation API is not supported on this device.');
      return;
    }

    setGeoLoading(true);
    setGeoResult('Acquiring real satellite GPS coordinates from your device...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLoading(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const acc = Math.round(pos.coords.accuracy || 10);

        setTestLat(lat.toFixed(6));
        setTestLng(lng.toFixed(6));
        setTestAccuracy(String(acc));

        // Submit to target device or auto-register this node
        if (targetDeviceId) {
          const res = onReportLocation(targetDeviceId, {
            latitude: lat,
            longitude: lng,
            accuracyMeters: acc,
            source: 'gps',
            batteryLevelPercent: 95,
            addressName: 'Live Browser GPS Observation',
          });
          if (res.success) {
            setGeoResult(`Real GPS fix ingested! Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}, Acc: ±${acc}m.`);
          } else {
            setGeoResult(`Ingestion rejected: ${res.error}`);
          }
        } else {
          onRegisterBrowserDevice({ latitude: lat, longitude: lng, accuracy: acc });
          setGeoResult(`Registered this browser as your first PhoneFinder hardware node with live GPS fix (${lat.toFixed(5)}, ${lng.toFixed(5)})!`);
        }
      },
      (err) => {
        setGeoLoading(false);
        setGeoResult(`Location error (${err.code}): ${err.message}. If prompted, grant location access.`);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(testLat);
    const lng = parseFloat(testLng);
    const acc = parseInt(testAccuracy, 10);
    const bat = parseInt(testBattery, 10);

    const res = onReportLocation(targetDeviceId, {
      latitude: lat,
      longitude: lng,
      accuracyMeters: acc,
      source: testSource,
      batteryLevelPercent: bat,
      addressName: 'Companion Telemetry Stream',
    });

    if (res.success) {
      setReportFeedback({ success: true, msg: 'Telemetry successfully ingested and validated!' });
    } else {
      setReportFeedback({ success: false, msg: res.error || 'Validation error' });
    }

    setTimeout(() => setReportFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Mobile Companion Testbed & Native Architecture</h2>
        <p className="text-xs text-slate-500 mt-1">
          Test real GPS coordinates via browser sensor, inject simulated field telemetry, or inspect production Flutter, Android Kotlin, and iOS Swift native implementation code.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Testbed Column (1 col) */}
        <div className="space-y-6">
          {/* Card 1: Live Hardware Geolocation */}
          <div className="bg-white rounded-xl border border-blue-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Live Device GPS Test</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Triggers your current device’s native GPS sensor via HTML5 Geolocation API to stream authentic coordinates into your recovery dashboard.
            </p>

            <button
              onClick={handleCaptureRealGeolocation}
              disabled={geoLoading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Radio className={`w-4 h-4 ${geoLoading ? 'animate-spin' : ''}`} />
              <span>{geoLoading ? 'Acquiring GPS Fix...' : 'Capture My Current GPS'}</span>
            </button>

            {geoResult && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-mono">
                {geoResult}
              </div>
            )}
          </div>

          {/* Card 2: Field Telemetry Injection */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Inject Telemetry Fix</h3>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Target Device</label>
                <select
                  value={targetDeviceId}
                  onChange={(e) => setTargetDeviceId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900"
                >
                  {devices.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.platform.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={testLat}
                    onChange={(e) => setTestLat(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={testLng}
                    onChange={(e) => setTestLng(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Accuracy (m)</label>
                  <input
                    type="number"
                    value={testAccuracy}
                    onChange={(e) => setTestAccuracy(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Battery (%)</label>
                  <input
                    type="number"
                    value={testBattery}
                    onChange={(e) => setTestBattery(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Location Source</label>
                <select
                  value={testSource}
                  onChange={(e) => setTestSource(e.target.value as any)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-slate-900"
                >
                  <option value="gps">Hardware GPS Fix</option>
                  <option value="network">Cellular / Wi-Fi Assisted</option>
                  <option value="ip_estimate">IP-Derived Estimate (Coarse)</option>
                </select>
              </div>

              {reportFeedback && (
                <div
                  className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                    reportFeedback.success ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
                  }`}
                >
                  {reportFeedback.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  <span>{reportFeedback.msg}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold transition-all shadow-sm"
              >
                Ingest Coordinate Observation
              </button>
            </form>
          </div>
        </div>

        {/* Code & Architecture Viewer (2 cols) */}
        <div className="lg:col-span-2 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col h-[650px] shadow-sm">
          {/* Navigation Bar inside Code Box */}
          <div className="bg-slate-900 border-b border-slate-800 p-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {[
                { id: 'flutter', label: 'Flutter Dart Companion' },
                { id: 'android', label: 'Android Kotlin Service' },
                { id: 'ios', label: 'iOS Swift CoreLocation' },
                { id: 'api', label: 'OpenAPI REST Contract' },
                { id: 'offline_research', label: 'Offline BLE Discovery Module' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCodeTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-md font-mono whitespace-nowrap transition-colors ${
                    activeCodeTab === tab.id
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Code Body */}
          <div className="flex-1 overflow-auto p-4 text-xs font-mono text-slate-300 leading-relaxed bg-slate-950">
            {activeCodeTab === 'flutter' && (
              <pre>
{`// lib/services/phonefinder_service.dart
// Production Flutter Companion Client for Android & iOS
import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;
import 'package:sqflite/sqflite.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

class PhoneFinderService {
  static const String serverUrl = 'https://api.phonefinder.example.com/v1';
  final String deviceToken;
  late Database _offlineDb;

  PhoneFinderService({required this.deviceToken});

  Future<void> initialize() async {
    _offlineDb = await openDatabase('phonefinder_offline.db', version: 1,
      onCreate: (db, version) {
        return db.execute(
          'CREATE TABLE offline_pings(id INTEGER PRIMARY KEY, lat REAL, lng REAL, acc REAL, ts INTEGER)'
        );
      });

    // Verify background location permissions
    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }

    // Start background stream with power-aware distance filters
    final locationSettings = LocationSettings(
      accuracy: LocationAccuracy.high,
      distanceFilter: 25, // meters
    );

    Geolocator.getPositionStream(locationSettings: locationSettings).listen((Position pos) {
      _handleLocationFix(pos);
    });

    // Monitor network connectivity to trigger batch flush
    Connectivity().onConnectivityChanged.listen((ConnectivityResult result) {
      if (result != ConnectivityResult.none) {
        _flushOfflineQueue();
      }
    });
  }

  Future<void> _handleLocationFix(Position pos) async {
    final payload = {
      'latitude': pos.latitude,
      'longitude': pos.longitude,
      'accuracyMeters': pos.accuracy.round(),
      'timestamp': DateTime.now().millisecondsSinceEpoch,
      'source': 'gps',
      'speedMps': pos.speed,
    };

    try {
      final res = await http.post(
        Uri.parse('\$serverUrl/devices/\$deviceToken/locations'),
        headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer \$deviceToken'},
        body: jsonEncode(payload),
      ).timeout(const Duration(seconds: 5));

      if (res.statusCode != 200) {
        await _bufferOffline(payload);
      }
    } catch (_) {
      // Network unreachable: buffer locally in SQLite
      await _bufferOffline(payload);
    }
  }

  Future<void> _bufferOffline(Map<String, dynamic> data) async {
    await _offlineDb.insert('offline_pings', {
      'lat': data['latitude'],
      'lng': data['longitude'],
      'acc': data['accuracyMeters'],
      'ts': data['timestamp'],
    });
  }

  Future<void> _flushOfflineQueue() async {
    final records = await _offlineDb.query('offline_pings', limit: 50);
    if (records.isEmpty) return;

    final batchPayload = records.map((r) => {
      'latitude': r['lat'],
      'longitude': r['lng'],
      'accuracyMeters': r['acc'],
      'timestamp': r['ts'],
      'source': 'gps',
      'isCachedOffline': true,
    }).toList();

    final res = await http.post(
      Uri.parse('\$serverUrl/devices/\$deviceToken/locations/batch'),
      headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer \$deviceToken'},
      body: jsonEncode({'records': batchPayload}),
    );

    if (res.statusCode == 200) {
      await _offlineDb.delete('offline_pings');
    }
  }
}`}
              </pre>
            )}

            {activeCodeTab === 'android' && (
              <pre>
{`// Android: PhoneFinderForegroundService.kt
package com.phonefinder.service

import android.app.*
import android.content.Intent
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.google.android.gms.location.*

class PhoneFinderForegroundService : Service() {
    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private lateinit var locationCallback: LocationCallback

    override fun onCreate() {
        super.onCreate()
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)

        val channel = NotificationChannel(
            "phonefinder_recovery_channel",
            "PhoneFinder Sentinel",
            NotificationManager.IMPORTANCE_LOW
        ).apply { description = "Monitoring coordinates for device recovery" }

        val manager = getSystemService(NotificationManager::class.java)
        manager.createNotificationChannel(channel)

        val notification = NotificationCompat.Builder(this, "phonefinder_recovery_channel")
            .setContentTitle("PhoneFinder Active")
            .setContentText("Background recovery sentinel active")
            .setSmallIcon(android.R.drawable.ic_menu_mylocation)
            .build()

        startForeground(1001, notification)

        val locationRequest = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 60000)
            .setMinUpdateIntervalMillis(30000)
            .setMinUpdateDistanceMeters(20f)
            .build()

        locationCallback = object : LocationCallback() {
            override fun onLocationResult(locationResult: LocationResult) {
                for (location in locationResult.locations) {
                    PhoneFinderNetworkClient.dispatchTelemetry(location)
                }
            }
        }

        fusedLocationClient.requestLocationUpdates(locationRequest, locationCallback, null)
    }

    override fun onBind(intent: Intent?): IBinder? = null
}`}
              </pre>
            )}

            {activeCodeTab === 'ios' && (
              <pre>
{`// iOS: PhoneFinderLocationManager.swift
import Foundation
import CoreLocation

class PhoneFinderLocationManager: NSObject, CLLocationManagerDelegate {
    static let shared = PhoneFinderLocationManager()
    private let locationManager = CLLocationManager()
    
    override init() {
        super.init()
        locationManager.delegate = self
        locationManager.desiredAccuracy = kCLLocationAccuracyBest
        locationManager.distanceFilter = 25.0 // Meters
        
        // Critical iOS Background Capabilities:
        locationManager.allowsBackgroundLocationUpdates = true
        locationManager.showsBackgroundLocationIndicator = true
        locationManager.pausesLocationUpdatesAutomatically = false
    }
    
    func startSentinel() {
        let authStatus = locationManager.authorizationStatus
        if authStatus == .notDetermined {
            locationManager.requestAlwaysAuthorization()
        } else if authStatus == .authorizedAlways {
            locationManager.startUpdatingLocation()
            locationManager.startMonitoringSignificantLocationChanges()
        }
    }
    
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let latest = locations.last else { return }
        
        // Discard cached fixes older than 15 seconds
        if abs(latest.timestamp.timeIntervalSinceNow) > 15.0 { return }
        
        let payload: [String: Any] = [
            "latitude": latest.coordinate.latitude,
            "longitude": latest.coordinate.longitude,
            "accuracyMeters": Int(latest.horizontalAccuracy),
            "timestamp": Int(latest.timestamp.timeIntervalSince1970 * 1000),
            "source": "gps",
            "speedMps": latest.speed
        ]
        
        PhoneFinderAPI.shared.transmitFix(payload)
    }
}`}
              </pre>
            )}

            {activeCodeTab === 'api' && (
              <pre>
{`openapi: 3.1.0
info:
  title: PhoneFinder Recovery Ingestion API
  version: 1.0.0
paths:
  /api/v1/devices/{deviceId}/locations:
    post:
      summary: Ingest coordinate observation from authorized companion
      security:
        - BearerAuth: []
      parameters:
        - name: deviceId
          in: path
          required: true
          schema: { type: string }
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [latitude, longitude, timestamp, source]
              properties:
                latitude: { type: number, minimum: -90, maximum: 90 }
                longitude: { type: number, minimum: -180, maximum: 180 }
                accuracyMeters: { type: integer, minimum: 1, maximum: 50000 }
                timestamp: { type: integer, description: "Epoch milliseconds" }
                source: { type: string, enum: [gps, network, integration, ip_estimate] }
                batteryLevelPercent: { type: integer, minimum: 0, maximum: 100 }
      responses:
        '200':
          description: Observation validated and ingested
        '400':
          description: Invalid coordinates or rejected timestamp
        '403':
          description: Location reporting currently paused by user

  /api/v1/devices/{deviceId}/alarm:
    post:
      summary: Request remote emergency ring sound on device
      responses:
        '200':
          description: Push wake payload dispatched`}
              </pre>
            )}

            {activeCodeTab === 'offline_research' && (
              <pre>
{`// =========================================================================
// SECTION 11.G: OFFLINE DISCOVERY RESEARCH MODULE
// =========================================================================
// INVESTIGATION OF CROWDSOURCED BLUETOOTH LOW ENERGY (BLE) FINDING NETWORKS
//
// 1. ARCHITECTURAL LIMITATION & REALITY:
//    - Apple Find My Network & Google Find My Device Network use proprietary,
//      OS-privileged firmware stacks running on Apple Silicon / Titan M2 chips.
//    - Third-party web and consumer apps CANNOT listen to arbitrary BLE
//      advertisements in the background on iOS without private entitlements.
//
// 2. CRYPTOGRAPHIC PROXIMITY DISCOVERY DESIGN:
//    - Lost Device: Emits rotating, encrypted BLE advertisement packets
//      containing an ephemeral public key derived from an Elliptic Curve (P-256)
//      seed. The key rotates every 15 minutes to prevent tracking of the victim.
//    - Relay Device (Participating PhoneFinder Node):
//      Discovers the beacon, captures its current GPS location, encrypts the
//      location against the beacon's ephemeral public key, and relays the
//      encrypted blob to the PhoneFinder backend without knowing whose phone it is.
//    - Device Owner:
//      Only the owner possessing the private master seed can decrypt the
//      relayed location payload.
//
// 3. ANTI-STALKING SAFEGUARDS:
//    - BLE beacons must include standardized non-linkable identifiers.
//    - If an unfamiliar PhoneFinder BLE beacon follows an individual for > 30 mins,
//      the OS emits an "Unknown Tracker Detected" safety alert.
//
// 4. PLATFORM STATUS:
//    - Status: Integration candidate requiring MFi / Apple Find My Network
//      accessory certification and Google Nearby Partner licensing.`}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
