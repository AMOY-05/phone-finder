/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PhoneFinder: Secure Cross-Platform Phone Recovery Main Application
 */

import React, { useEffect, useState } from 'react';
import { deviceStore } from './services/deviceStore';
import { RegisteredDevice, AlertNotification, PrivacyPreferences, UserAccount } from './types/phonefinder';
import { Navbar, ActiveTab } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { DeviceList } from './components/DeviceList';
import { DeviceRecovery } from './components/DeviceRecovery';
import { LocationHistoryView } from './components/LocationHistoryView';
import { AlertsView } from './components/AlertsView';
import { PrivacySettingsView } from './components/PrivacySettingsView';
import { HelpAndGuidance } from './components/HelpAndGuidance';
import { MobileCompanionView } from './components/MobileCompanionView';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { RegisterDeviceModal } from './components/RegisterDeviceModal';
import { CheckCircle2, AlertTriangle, Shield } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserAccount>(() => deviceStore.getUser());
  const [devices, setDevices] = useState<RegisteredDevice[]>(() => deviceStore.getDevices());
  const [notifications, setNotifications] = useState<AlertNotification[]>(() => deviceStore.getNotifications());
  const [privacy, setPrivacy] = useState<PrivacyPreferences>(() => deviceStore.getPrivacy());

  // Check URL params for autostart
  const params = new URLSearchParams(window.location.search);
  const autostart = params.get('autostart') === '1';

  const [activeTab, setActiveTab] = useState<ActiveTab | 'landing'>(autostart ? 'dashboard' : 'dashboard');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(() => devices[0]?.id || '');

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Subscribe to deviceStore updates
  useEffect(() => {
    const unsubscribe = deviceStore.subscribe(() => {
      setDevices([...deviceStore.getDevices()]);
      setNotifications([...deviceStore.getNotifications()]);
      setPrivacy({ ...deviceStore.getPrivacy() });
      setCurrentUser({ ...deviceStore.getUser() });
    });
    return unsubscribe;
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSelectDevice = (id: string) => {
    setSelectedDeviceId(id);
    setActiveTab('recovery');
  };

  const handleViewHistory = (id: string) => {
    setSelectedDeviceId(id);
    setActiveTab('history');
  };

  const handleTriggerAlarm = (id: string) => {
    deviceStore.triggerRemoteAlarm(id);
    showToast('Dual-tone remote siren sounded on device!');
  };

  const handleStopAlarm = (id: string) => {
    deviceStore.stopRemoteAlarm(id);
    showToast('Remote siren silenced.');
  };

  const handleStopAllAlarms = () => {
    deviceStore.stopRemoteAlarm();
    showToast('All remote alarms deactivated.');
  };

  const handleToggleLostMode = (id: string, enabled: boolean, msg?: string, phone?: string) => {
    deviceStore.toggleLostMode(id, enabled, msg, phone);
    showToast(enabled ? 'Lost mode armed on device lock screen.' : 'Lost mode disarmed.');
  };

  const handleRequestPing = (id: string) => {
    // Generate slight jitter to simulate live fresh ping
    const dev = deviceStore.getDeviceById(id);
    if (dev?.lastLocation) {
      const latJitter = (Math.random() - 0.5) * 0.0003;
      const lngJitter = (Math.random() - 0.5) * 0.0003;
      deviceStore.reportLocation(id, {
        latitude: dev.lastLocation.latitude + latJitter,
        longitude: dev.lastLocation.longitude + lngJitter,
        accuracyMeters: 6,
        source: 'gps',
        batteryLevelPercent: Math.max(1, dev.batteryLevelPercent - 1),
      });
    }
    showToast('Live telemetry ping received from device.');
  };

  const handleDeregister = (id: string) => {
    deviceStore.deregisterDevice(id);
    showToast('Device successfully deregistered and wiped from account.');
    if (selectedDeviceId === id && devices.length > 1) {
      const remaining = devices.filter((d) => d.id !== id);
      setSelectedDeviceId(remaining[0].id);
    }
  };

  const handleRegisterDevice = (deviceData: any) => {
    const newDev = deviceStore.registerDevice(deviceData);
    setSelectedDeviceId(newDev.id);
    showToast(`Device "${newDev.name}" registered successfully!`);
    setActiveTab('recovery');
  };

  const handleSetGeofence = (id: string, radiusMeters: number, name?: string) => {
    deviceStore.setDeviceGeofence(id, { radiusMeters, name });
    showToast(`Virtual perimeter (${radiusMeters}m) set around device.`);
  };

  const handleToggleGeofence = (id: string, enabled: boolean) => {
    deviceStore.toggleDeviceGeofence(id, enabled);
    showToast(enabled ? 'Virtual perimeter armed.' : 'Virtual perimeter disarmed.');
  };

  const handleRemoveGeofence = (id: string) => {
    deviceStore.removeDeviceGeofence(id);
    showToast('Virtual perimeter removed.');
  };

  const handleSimulateGeofenceMovement = (id: string, breach: boolean) => {
    deviceStore.simulateGeofenceMovement(id, breach);
    showToast(
      breach
        ? 'Simulated movement outside boundary! Breach alert triggered.'
        : 'Simulated movement within safe boundary.'
    );
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Toast Notification Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Global Navigation Bar */}
      <Navbar
        activeTab={activeTab === 'landing' ? 'dashboard' : activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        devices={devices}
        notifications={notifications}
        onStopAllAlarms={handleStopAllAlarms}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'landing' && (
          <LandingPage
            onGetStarted={() => setActiveTab('dashboard')}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {activeTab === 'dashboard' && (
          <Dashboard
            devices={devices}
            notifications={notifications}
            onSelectDevice={handleSelectDevice}
            onOpenRegisterModal={() => setRegisterModalOpen(true)}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onRefreshData={() => showToast('Polled all connected device sentinel channels.')}
          />
        )}

        {activeTab === 'devices' && (
          <DeviceList
            devices={devices}
            onSelectDevice={handleSelectDevice}
            onOpenRegisterModal={() => setRegisterModalOpen(true)}
            onTriggerAlarm={handleTriggerAlarm}
            onDeregisterDevice={handleDeregister}
            onToggleLostMode={(id, enabled) => handleToggleLostMode(id, enabled)}
          />
        )}

        {activeTab === 'recovery' && (
          <DeviceRecovery
            devices={devices}
            selectedDeviceId={selectedDeviceId || devices[0]?.id || ''}
            onSelectDevice={(id) => setSelectedDeviceId(id)}
            onTriggerAlarm={handleTriggerAlarm}
            onStopAlarm={handleStopAlarm}
            onToggleLostMode={handleToggleLostMode}
            onRequestPing={handleRequestPing}
            onViewHistory={handleViewHistory}
            onOpenHelp={() => setActiveTab('help')}
            onOpenRegisterModal={() => setRegisterModalOpen(true)}
            onSetGeofence={handleSetGeofence}
            onToggleGeofence={handleToggleGeofence}
            onRemoveGeofence={handleRemoveGeofence}
            onSimulateGeofenceMovement={handleSimulateGeofenceMovement}
          />
        )}

        {activeTab === 'history' && (
          <LocationHistoryView
            devices={devices}
            selectedDeviceId={selectedDeviceId || devices[0]?.id || ''}
            onSelectDevice={(id) => setSelectedDeviceId(id)}
            getLocationsForDevice={(id) => deviceStore.getLocationsForDevice(id)}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertsView
            notifications={notifications}
            privacy={privacy}
            onMarkAsRead={(id) => deviceStore.markNotificationAsRead(id)}
            onMarkAllAsRead={() => deviceStore.markAllNotificationsAsRead()}
            onUpdatePrivacy={(up) => deviceStore.updatePrivacy(up)}
          />
        )}

        {activeTab === 'privacy' && (
          <PrivacySettingsView
            user={currentUser}
            privacy={privacy}
            auditTrail={deviceStore.getAuditTrail()}
            onUpdatePrivacy={(up) => deviceStore.updatePrivacy(up)}
            onExportData={() => deviceStore.exportUserDataPackage()}
            onResetSeedData={() => {
              deviceStore.resetAllToSeed();
              showToast('Data reset to baseline seed.');
            }}
          />
        )}

        {activeTab === 'help' && <HelpAndGuidance />}

        {activeTab === 'mobile_specs' && (
          <MobileCompanionView
            devices={devices}
            onReportLocation={(id, data) => deviceStore.reportLocation(id, data)}
            onRegisterBrowserDevice={(coords) =>
              handleRegisterDevice({
                name: 'Browser Companion Node',
                platform: 'web_companion',
                model: navigator.userAgent.includes('Mac') ? 'Mac Web Node' : 'PC Web Node',
                osVersion: 'Chrome / WebKit API',
                initialCoords: coords,
              })
            }
          />
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={(usr) => {
          showToast(`Signed in as ${usr.fullName}`);
          setActiveTab('dashboard');
        }}
      />

      {/* Register Device Modal */}
      <RegisterDeviceModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onRegister={handleRegisterDevice}
      />
    </div>
  );
}
