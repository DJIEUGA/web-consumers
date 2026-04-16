import { useCallback, useEffect, useMemo, useState } from "react";

type InstallOutcome = "accepted" | "dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: InstallOutcome; platform: string }>;
}

interface UsePWAInstallPromptResult {
  canPromptInstall: boolean;
  isIOS: boolean;
  isInstalled: boolean;
  shouldShowPrompt: boolean;
  promptInstall: () => Promise<InstallOutcome | null>;
  dismissPrompt: () => void;
}

const DISMISS_STORAGE_KEY = "jobty:pwa-install-dismissed:v1";

function getInitialDismissed(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return window.localStorage.getItem(DISMISS_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function getInitialInstalled(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const standaloneMatch =
    window.matchMedia?.("(display-mode: standalone)").matches ?? false;
  const iOSStandalone =
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
    true;

  return standaloneMatch || iOSStandalone;
}

export function usePWAInstallPrompt(): UsePWAInstallPromptResult {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(getInitialInstalled);
  const [isDismissed, setIsDismissed] = useState<boolean>(getInitialDismissed);

  const isIOS = useMemo(() => {
    if (typeof navigator === "undefined" || typeof window === "undefined") {
      return false;
    }

    const ua = navigator.userAgent.toLowerCase();
    const iOSDevice = /iphone|ipad|ipod/.test(ua);
    const isMSStream = (window as Window & { MSStream?: unknown }).MSStream;

    return iOSDevice && !isMSStream;
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      const installEvent = event as BeforeInstallPromptEvent;
      installEvent.preventDefault();
      setDeferredPrompt(installEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      localStorage.removeItem(DISMISS_STORAGE_KEY);
      setIsDismissed(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const dismissPrompt = useCallback(() => {
    localStorage.setItem(DISMISS_STORAGE_KEY, "1");
    setIsDismissed(true);
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) {
      return null;
    }

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === "accepted") {
      setIsInstalled(true);
      localStorage.removeItem(DISMISS_STORAGE_KEY);
      setIsDismissed(false);
    }

    setDeferredPrompt(null);
    return choice.outcome;
  }, [deferredPrompt]);

  const canPromptInstall = Boolean(deferredPrompt);
  const shouldShowPrompt = !isInstalled && !isDismissed && (canPromptInstall || isIOS);

  return {
    canPromptInstall,
    isIOS,
    isInstalled,
    shouldShowPrompt,
    promptInstall,
    dismissPrompt,
  };
}
