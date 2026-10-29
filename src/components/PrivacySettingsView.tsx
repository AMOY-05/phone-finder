/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Screen 9: Privacy Settings, Retention Policies, Audit Trail, and Data Export
 */

import React, { useState } from 'react';
import {
  Lock,
  Shield,
  Download,
  Trash2,
  Clock,
  Key,
  PauseCircle,
  PlayCircle,
  FileText,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { AuditEvent, PrivacyPreferences, UserAccount } from '../types/phonefinder';

interface PrivacySettingsViewProps {
  user: UserAccount;
  privacy: PrivacyPreferences;
  auditTrail: AuditEvent[];
  onUpdatePrivacy: (updates: Partial<PrivacyPreferences>) => void;
  onExportData: () => string;
  onResetSeedData: () => void;
}

export const PrivacySettingsView: React.FC<PrivacySettingsViewProps> = ({
  user,
  privacy,
  auditTrail,
  onUpdatePrivacy,
  onExportData,
  onResetSeedData,
}) => {
  const [exportNotice, setExportNotice] = useState(false);

  const handleExport = () => {
    const jsonStr = onExportData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `phonefinder_gdpr_export_${user.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Privacy Controls & Audit Trail</h2>
        <p className="text-xs text-slate-500 mt-1">
          Manage location data retention windows, pause telemetry ingestion, inspect audit events, or export all data under GDPR/CCPA.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Privacy Controls & Data Retention (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Ingestion Pause & High Accuracy */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>Location Ingestion Master Controls</span>
            </h3>

            <div className="p-4 rounded-xl border flex items-center justify-between gap-4 transition-colors bg-slate-50 border-slate-200">
              <div>
                <div className="text-xs font-bold text-slate-800">
                  {privacy.pauseLocationReporting ? 'Location Reporting Paused' : 'Location Reporting Active'}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {privacy.pauseLocationReporting
                    ? 'All incoming coordinate fixes are discarded at the server boundary.'
                    : 'Authorized companion devices may ingest coordinate updates into your account.'}
                </div>
              </div>
              <button
                onClick={() => onUpdatePrivacy({ pauseLocationReporting: !privacy.pauseLocationReporting })}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  privacy.pauseLocationReporting
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-amber-600 hover:bg-amber-500 text-white'
                }`}
              >
                {privacy.pauseLocationReporting ? (
                  <>
                    <PlayCircle className="w-4 h-4" />
                    <span>Resume Reporting</span>
                  </>
                ) : (
                  <>
                    <PauseCircle className="w-4 h-4" />
                    <span>Pause Reporting</span>
                  </>
                )}
              </button>
            </div>

            {/* Retention Window */}
            <div className="pt-3 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Automated Location Data Retention Policy
              </label>
              <p className="text-[11px] text-slate-500 mb-3">
                Location records older than this duration are automatically purged from the database permanently.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { days: 1, label: '24 Hours' },
                  { days: 7, label: '7 Days' },
                  { days: 30, label: '30 Days (Rec.)' },
                  { days: 90, label: '90 Days Max' },
                ].map((item) => (
                  <button
                    key={item.days}
                    onClick={() => onUpdatePrivacy({ retentionDays: item.days })}
                    className={`p-2.5 rounded-lg text-xs font-semibold border transition-all ${
                      privacy.retentionDays === item.days
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Audit Trail Log */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Security Audit Trail</h3>
              </div>
              <span className="text-[11px] font-mono text-slate-500">{auditTrail.length} Logged Events</span>
            </div>
            <p className="text-xs text-slate-500">
              Immutable server-side audit logs capturing authentication sessions, location updates, and recovery actions.
            </p>

            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {auditTrail.map((evt) => (
                <div
                  key={evt.id}
                  className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs font-mono space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-blue-800 bg-blue-100/70 px-1.5 py-0.2 rounded">
                      {evt.action}
                    </span>
                    <span className="text-slate-500">{new Date(evt.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-slate-700 font-sans text-xs">{evt.details}</p>
                  <div className="text-[10px] text-slate-400">
                    Client IP: {evt.ipAddress} • {evt.category.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Account Security & Data Export (1 col) */}
        <div className="space-y-6">
          {/* Account Security Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Account Credentials</h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Email Address</span>
                <span className="font-semibold text-slate-800">{user.email}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Two-Factor Auth</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Enabled (TOTP)
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Account Role</span>
                <span className="font-mono text-slate-800 font-semibold">{user.role}</span>
              </div>
            </div>
          </div>

          {/* GDPR / CCPA Data Export */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Data Portability (GDPR)</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Download a machine-readable JSON archive containing all devices, historical coordinates, security preferences, and audit logs.
            </p>

            {exportNotice && (
              <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Export generated and saved to your device.</span>
              </div>
            )}

            <button
              onClick={handleExport}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download Complete Archive</span>
            </button>
          </div>

          {/* Reset / Demo Purge */}
          <div className="bg-white rounded-xl border border-red-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-4 h-4" />
              <h3 className="text-sm font-bold text-slate-900">Reset Demo Data</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Clear local storage cache and reinitialize sample devices and locations to their original baseline.
            </p>
            <button
              onClick={() => {
                if (window.confirm('Reset all PhoneFinder data to fresh demo baseline?')) {
                  onResetSeedData();
                }
              }}
              className="w-full py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-semibold transition-colors"
            >
              Reset to Initial Seed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
