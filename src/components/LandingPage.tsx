/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Screen 1: PhoneFinder Landing Page with Transparent Technical Reality & Capabilities
 */

import React from 'react';
import {
  Radio,
  Shield,
  MapPin,
  Clock,
  Volume2,
  Lock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  ExternalLink,
  Smartphone,
  ChevronDown,
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onOpenAuth: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onOpenAuth,
}) => {
  return (
    <div className="space-y-16 py-6">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto px-4 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>Production Cross-Platform Phone Recovery Architecture</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Locate, manage, and recover your lost devices with <span className="text-blue-600">honest precision</span>.
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          PhoneFinder empowers verified owners to track Android and iOS devices using legitimate operating-system location services, real-time telemetry freshness, and cryptographically verified boundaries.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all hover:scale-102"
          >
            <span>Launch Recovery Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenAuth}
            className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-sm font-bold shadow-xs transition-colors"
          >
            Sign In / Register
          </button>
        </div>

        {/* Value Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Zero Fake Switched-Off Claims</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>WGS84 Coordinate Validation</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Configurable 24h-90d Retention</span>
          </div>
        </div>
      </section>

      {/* Honest Technical Reality Section (What We Can & Cannot Do) */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="bg-slate-900 rounded-2xl p-8 text-white border border-slate-800 shadow-xl space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Technical Reality & Platform Constraints</h2>
            <p className="text-xs text-slate-400">
              Unlike fraudulent apps promising to magically track any phone via phone number or when completely powered down, PhoneFinder adheres to verifiable operating system APIs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* What PhoneFinder Does */}
            <div className="bg-slate-800/80 rounded-xl p-5 border border-emerald-500/30 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>What PhoneFinder Legally & Reliably Delivers:</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span><strong>Live GPS Streaming:</strong> Ingests high-accuracy coordinates when the companion app is authorized and connected.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span><strong>Last-Known Position:</strong> Honestly displays the last verified coordinate timestamp when a phone goes offline.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span><strong>Remote Siren Alarm:</strong> Dispatches high-priority wake alerts to play max-volume sound for recovery.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span><strong>Lost Mode Lock Display:</strong> Renders emergency contact numbers for finders to return the phone.</span>
                </li>
              </ul>
            </div>

            {/* What We Refuse to Fabricate */}
            <div className="bg-slate-800/80 rounded-xl p-5 border border-rose-500/30 space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <XCircle className="w-5 h-5 shrink-0" />
                <span>What Cannot Be Done Without Privileged Firmware:</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-rose-400">✗</span>
                  <span><strong>Switched-Off Phone Tracking:</strong> No web app can poll GPS when modem and SoC lack battery power. We display last known fix.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400">✗</span>
                  <span><strong>IMEI Web Spying:</strong> IMEI numbers identify hardware to carriers; they do not expose a public GPS streaming API.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400">✗</span>
                  <span><strong>Covert Stalker Tracking:</strong> PhoneFinder mandates visible background location disclosures and informed consent.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400">✗</span>
                  <span><strong>Universal Hardware Erase:</strong> Full factory wipe requires first-party Google Find Hub or Apple Find My portals.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillar Grid */}
      <section className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900">Engineered for Rapid Device Recovery</h2>
          <p className="text-xs text-slate-500 mt-1">Four tightly integrated pillars connecting companion hardware to your dashboard</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Interactive Precision Map</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Real-time Leaflet map rendering accuracy circles (±6m), street/satellite tiles, and coordinate bounds.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Route History & Trails</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Chronological breadcrumbs of movement with GPX and GeoJSON export capabilities for law enforcement.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold">
              <Volume2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Dual-Tone Remote Siren</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Real Web Audio siren synthesizer triggers piercing tones to pinpoint phones misplaced nearby.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Automated Data Purge</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Configurable 24h, 7d, or 30d retention windows automatically destroy old coordinates permanently.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 space-y-4">
        <h2 className="text-xl font-bold text-slate-900 text-center mb-6">Frequently Asked Questions</h2>

        <div className="space-y-3">
          {[
            {
              q: 'Can PhoneFinder locate a phone whose battery is completely dead?',
              a: 'No, and no legitimate third-party app can. When a phone runs out of battery, its GPS chip, modem, and CPU are completely unpowered. PhoneFinder displays the last valid coordinate recorded before shutdown with an exact timestamp.',
            },
            {
              q: 'How does PhoneFinder handle poor cellular connectivity or subway tunnels?',
              a: 'The native companion application buffers GPS observations locally in an encrypted SQLite database. As soon as the phone regains signal, it safely flushes queued records to the server using bounded exponential backoff.',
            },
            {
              q: 'Can someone track my phone without my knowledge using PhoneFinder?',
              a: 'Never. PhoneFinder requires explicit installation of the companion app, interactive OS permission grants ("Allow all the time"), and displays a persistent Android/iOS background notification indicator.',
            },
            {
              q: 'How does PhoneFinder compare to Google Find My Device and Apple Find My?',
              a: 'PhoneFinder provides a cross-platform, multi-device dashboard with configurable data retention, GPX route exports, and unified alerts. For hardware-level firmware wiping or eSIM locking, we seamlessly guide you to the manufacturer portals.',
            },
          ].map((faq, i) => (
            <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <h3 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs text-slate-600 mt-2 pl-6 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 pt-8 pb-4 text-center text-xs text-slate-500">
        <div className="flex items-center justify-center gap-2 mb-2 font-bold text-slate-700">
          <Radio className="w-4 h-4 text-blue-600" />
          <span>PhoneFinder Production Recovery Platform</span>
        </div>
        <p>© 2026 PhoneFinder Inc. All rights reserved. Built with privacy and operational transparency.</p>
      </footer>
    </div>
  );
};
