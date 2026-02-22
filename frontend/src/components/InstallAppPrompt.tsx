import { useState, useEffect } from 'react';
import { XMarkIcon, ArrowDownTrayIcon, ShareIcon } from '@heroicons/react/24/outline';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallAppPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showAndroidPrompt, setShowAndroidPrompt] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone 
      || document.referrer.includes('android-app://');

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Detect device type
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);

    // Check if user has dismissed the prompt before
    const hasSeenPrompt = localStorage.getItem('pwa-install-prompt-dismissed');
    
    if (hasSeenPrompt) {
      return;
    }

    // Android: Listen for beforeinstallprompt event
    if (isAndroid) {
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        // Show prompt after 3 seconds
        setTimeout(() => {
          setShowAndroidPrompt(true);
        }, 3000);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }

    // iOS: Don't show automatic prompt (Apple doesn't support native install)
    // User can manually install from Settings page if needed
    if (isIOS && isSafari) {
      // Don't show automatic prompt on iOS
      // setShowIOSPrompt(true);
    }
  }, []);

  const handleAndroidInstall = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setIsInstalled(true);
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowAndroidPrompt(false);
  };

  const handleDismiss = (platform: 'android' | 'ios') => {
    if (platform === 'android') {
      setShowAndroidPrompt(false);
    } else {
      setShowIOSPrompt(false);
    }
    
    // Remember that user dismissed the prompt
    localStorage.setItem('pwa-install-prompt-dismissed', 'true');
  };

  // Don't show anything if app is already installed
  if (isInstalled) {
    return null;
  }

  // Android Install Prompt
  if (showAndroidPrompt && deferredPrompt) {
    return (
      <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-slide-up">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-2xl p-6 text-white">
          <button
            onClick={() => handleDismiss('android')}
            className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors"
            aria-label="Close"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>

          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <ArrowDownTrayIcon className="w-6 h-6" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1">Install 4Pixels CRM</h3>
              <p className="text-sm text-white/90 mb-4">
                Get quick access and work offline. Install our app on your device!
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleAndroidInstall}
                  className="flex-1 bg-white text-primary-600 px-4 py-2.5 rounded-xl font-semibold hover:bg-white/90 transition-colors shadow-lg"
                >
                  Install Now
                </button>
                <button
                  onClick={() => handleDismiss('android')}
                  className="px-4 py-2.5 text-white/90 hover:text-white transition-colors font-medium"
                >
                  Not Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // iOS Install Instructions
  if (showIOSPrompt) {
    return (
      <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-slide-up">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-2xl p-6 text-white relative overflow-hidden">
          {/* Decorative background */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
          
          <button
            onClick={() => handleDismiss('ios')}
            className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors z-10"
            aria-label="Close"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>

          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <ArrowDownTrayIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Install 4Pixels CRM</h3>
                <p className="text-xs text-white/80">Add to Home Screen</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
              <p className="text-sm font-medium mb-3">To install this app:</p>
              
              <ol className="space-y-2.5 text-sm">
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  <div className="flex-1">
                    <p>Tap the <span className="font-semibold">Share</span> button</p>
                    <div className="mt-1.5 inline-flex items-center space-x-1 bg-white/20 px-2 py-1 rounded-lg">
                      <ShareIcon className="w-4 h-4" />
                      <span className="text-xs font-medium">Share</span>
                    </div>
                  </div>
                </li>
                
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  <div className="flex-1">
                    <p>Scroll down and tap</p>
                    <div className="mt-1.5 inline-flex items-center space-x-1 bg-white/20 px-2 py-1 rounded-lg">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                      </svg>
                      <span className="text-xs font-medium">Add to Home Screen</span>
                    </div>
                  </div>
                </li>
                
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
                    3
                  </span>
                  <p className="flex-1">Tap <span className="font-semibold">Add</span> to confirm</p>
                </li>
              </ol>
            </div>

            <button
              onClick={() => handleDismiss('ios')}
              className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2.5 rounded-xl font-medium transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default InstallAppPrompt;
