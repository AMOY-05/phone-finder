/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Screen 10: Help, Emergency Guidance, and Official Recovery Integrations
 */

import React, { useState } from 'react';
import {
  LifeBuoy,
  ExternalLink,
  ShieldAlert,
  HelpCircle,
  Smartphone,
  BatteryCharging,
  WifiOff,
  AlertTriangle,
  FileCheck,
  PhoneCall,
  CheckCircle2,
} from 'lucide-react';

export const HelpAndGuidance: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState<
    'stolen' | 'offline' | 'switched_off' | 'permission_denied' | 'active'
  >('stolen');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 rounded-2xl p-6 text-white border border-blue-800 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <LifeBuoy className="w-5 h-5 text-amber-400" />
          <span className="text-xs uppercase font-mono tracking-wider text-amber-300 font-bold">
            Emergency Device Recovery Protocols
          </span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Recovery Playbook & Triage</h2>
        <p className="text-xs text-blue-200 mt-1 max-w-2xl leading-relaxed">
          Transparent, realistic recovery procedures tailored to device state. When third-party tracking is bounded by OS security, follow these official platform protocols.
        </p>
      </div>

      {/* Scenario Selector Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'stolen', label: 'Phone Was Stolen / Robbed', icon: <ShieldAlert className="w-4 h-4 text-red-500" /> },
          { id: 'offline', label: 'Phone Is Offline (No Signal)', icon: <WifiOff className="w-4 h-4 text-orange-500" /> },
          { id: 'switched_off', label: 'Battery Dead or Switched Off', icon: <BatteryCharging className="w-4 h-4 text-slate-500" /> },
          { id: 'permission_denied', label: 'Location Services Revoked', icon: <AlertTriangle className="w-4 h-4 text-amber-500" /> },
          { id: 'active', label: 'Device Online & Ringing', icon: <Smartphone className="w-4 h-4 text-emerald-500" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveScenario(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
              activeScenario === tab.id
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Scenario Action Plan */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
        {activeScenario === 'stolen' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-red-700">
              <ShieldAlert className="w-6 h-6" />
              <div>
                <h3 className="text-base font-bold text-slate-900">Immediate Protocol: Suspected Stolen Phone</h3>
                <p className="text-xs text-slate-500">Do not attempt to confront a thief in person.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px]">
                  1
                </span>
                <h4 className="font-bold text-slate-900">Arm PhoneFinder Lost Mode</h4>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Use the Recovery screen to display an emergency callback number. Export your latest GPS coordinate history as a GPX/JSON file for official reporting.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px]">
                  2
                </span>
                <h4 className="font-bold text-slate-900">Lock via Official OS Portal</h4>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Log into Google Find My Device or Apple iCloud Find My to initiate hardware-level Activation Lock and remote wipe to protect your banking & credentials.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px]">
                  3
                </span>
                <h4 className="font-bold text-slate-900">Carrier IMEI Blacklist & Police</h4>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Contact your carrier (Verizon, AT&T, T-Mobile, Vodafone, etc.) with your 15-digit IMEI to blacklist the device from cellular networks and request SIM deactivation.
                </p>
              </div>
            </div>

            {/* Police Report Checklist */}
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-2">
              <div className="font-bold text-amber-900 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-amber-700" />
                <span>Police Report Evidence Checklist:</span>
              </div>
              <ul className="text-amber-800 list-disc list-inside space-y-1 text-[11px]">
                <li>Device IMEI (printed on retail box, purchase invoice, or Google/Apple dashboard).</li>
                <li>Last known GPS coordinates and exact timestamp from PhoneFinder history.</li>
                <li>Make, exact model code, color, serial number, and distinctive marks.</li>
                <li>Do NOT give police your account passwords or two-factor SMS codes.</li>
              </ul>
            </div>
          </div>
        )}

        {activeScenario === 'offline' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <WifiOff className="w-5 h-5 text-orange-600" />
              <span>Handling an Offline Device (No Cellular / Wi-Fi)</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              When a phone loses cellular or Wi-Fi signal (e.g. underground transit, airplane mode, basement), it cannot transmit live updates to PhoneFinder. However, our native companion app caches observations in a secure SQLite store and transmits them immediately upon reconnecting.
            </p>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="font-bold text-slate-900">What to do now:</div>
              <ul className="list-disc list-inside text-slate-600 space-y-1 text-[11px]">
                <li>Inspect the "Last Known" coordinate marker on the Recovery Map.</li>
                <li>Enable the "Device Disconnect" alert so you receive an instant notification when it reconnects.</li>
                <li>Visit the last known location physically before battery depletion.</li>
              </ul>
            </div>
          </div>
        )}

        {activeScenario === 'switched_off' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BatteryCharging className="w-5 h-5 text-slate-700" />
              <span>Phone Is Switched Off or Battery Depleted</span>
            </h3>
            <div className="p-4 bg-rose-50 text-rose-900 rounded-xl border border-rose-200 text-xs space-y-2">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Technical Reality Check</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                No third-party application can wake a powered-off phone or obtain new live GPS coordinates while the main processor and cellular modem have no power. Be wary of fraudulent services claiming to locate turned-off phones using phone numbers or IMEI satellite sweeps.
              </p>
            </div>
            <div className="text-xs text-slate-600 space-y-1">
              <p>1. Check the last coordinate timestamp before power died on the Recovery Map.</p>
              <p>2. If using iPhone 11 or newer with Find My network enabled, Apple's low-power Bluetooth beacon may still relay proximity to nearby Apple devices through iCloud Find My.</p>
            </div>
          </div>
        )}

        {activeScenario === 'permission_denied' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>Re-enabling Background Location Permissions</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <h4 className="font-bold text-slate-900">Android Instructions:</h4>
                <ol className="list-decimal list-inside text-slate-600 space-y-1 text-[11px]">
                  <li>Open phone Settings &gt; Apps &gt; PhoneFinder.</li>
                  <li>Tap Permissions &gt; Location.</li>
                  <li>Select <strong>"Allow all the time"</strong> (required for background recovery).</li>
                  <li>Enable <strong>"Use precise location"</strong>.</li>
                  <li>Disable "Pause app activity if unused".</li>
                </ol>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <h4 className="font-bold text-slate-900">iOS (iPhone) Instructions:</h4>
                <ol className="list-decimal list-inside text-slate-600 space-y-1 text-[11px]">
                  <li>Open phone Settings &gt; Privacy & Security &gt; Location Services.</li>
                  <li>Find PhoneFinder in the app list.</li>
                  <li>Set to <strong>"Always"</strong>.</li>
                  <li>Toggle on <strong>"Precise Location"</strong>.</li>
                  <li>Enable Background App Refresh in General settings.</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {activeScenario === 'active' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-600" />
              <span>Device Online & Nearby</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              If the device has reported coordinates within the last 2 minutes and is online, trigger the Remote Ring sound from the Recovery screen to locate it under car seats, sofa cushions, or nearby rooms.
            </p>
          </div>
        )}
      </div>

      {/* Official Platform Integrations Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Official Manufacturer Device-Finding Portals
        </h3>
        <p className="text-xs text-slate-500">
          For hardware-level actions (remote factory wipe, Activation Lock, eSIM lock) that require first-party OS entitlements:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                <span>🤖</span>
                <span>Google Find Hub / Find My Device</span>
              </div>
              <p className="text-slate-600 text-[11px] mt-1">
                Official Google portal to locate, secure, or erase Android phones, tablets, and Wear OS watches.
              </p>
              <a
                href="https://www.google.com/android/find"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-bold mt-2"
              >
                <span>Open google.com/android/find</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                <span></span>
                <span>Apple iCloud Find My</span>
              </div>
              <p className="text-slate-600 text-[11px] mt-1">
                Official Apple web portal to locate iPhones, mark as lost, trigger Activation Lock, or erase device.
              </p>
              <a
                href="https://www.icloud.com/find"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-bold mt-2"
              >
                <span>Open icloud.com/find</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
