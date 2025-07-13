'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor, Zap } from 'lucide-react';
import TeslaCard from './TeslaUI/TeslaCard';
import TeslaButton from './TeslaUI/TeslaButton';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export const PWAInstaller: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already installed/running in standalone mode
    const checkStandalone = () => {
      setIsStandalone(
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true
      );
    };

    checkStandalone();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      
      // Save the event so it can be triggered later
      setDeferredPrompt(e);
      
      // Show install banner if not in standalone mode
      if (!isStandalone) {
        setTimeout(() => setShowInstallBanner(true), 3000); // Show after 3 seconds
      }
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('Life OS PWA was installed');
      setIsInstalled(true);
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registered successfully:', registration.scope);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker available
                  console.log('New service worker available');
                }
              });
            }
          });
        })
        .catch(error => {
          console.log('Service Worker registration failed:', error);
        });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isStandalone]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    // Don't show again for this session
    sessionStorage.setItem('pwa-banner-dismissed', 'true');
  };

  // Don't show if already installed, in standalone mode, or dismissed this session
  if (isInstalled || isStandalone || sessionStorage.getItem('pwa-banner-dismissed')) {
    return null;
  }

  if (!showInstallBanner || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <TeslaCard className="p-4 border border-blue-500/30 bg-gradient-to-r from-blue-900/20 to-purple-900/20 backdrop-blur-md">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white">Install Life OS</h3>
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-xs text-gray-300 mb-3">
              Get the full Tesla-style experience! Install Life OS as an app for:
            </p>
            
            <div className="space-y-1 mb-3">
              <div className="flex items-center space-x-2 text-xs text-gray-300">
                <Zap className="w-3 h-3 text-yellow-400" />
                <span>Faster performance & offline access</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-300">
                <Monitor className="w-3 h-3 text-blue-400" />
                <span>Desktop shortcuts & full-screen mode</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-300">
                <Download className="w-3 h-3 text-green-400" />
                <span>Push notifications for deadlines</span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <TeslaButton
                variant="primary"
                size="sm"
                onClick={handleInstallClick}
                className="flex-1 flex items-center justify-center space-x-1"
              >
                <Download className="w-3 h-3" />
                <span>Install App</span>
              </TeslaButton>
              
              <TeslaButton
                variant="secondary"
                size="sm"
                onClick={handleDismiss}
                className="px-3"
              >
                Later
              </TeslaButton>
            </div>
          </div>
        </div>
      </TeslaCard>
    </div>
  );
};

export default PWAInstaller;
