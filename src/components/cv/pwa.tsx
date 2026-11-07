"use client";

import { useEffect, useState } from "react";
import { Download, WifiOff } from "lucide-react";
import { dict } from "@/lib/cv/i18n";
import { Button } from "@/components/ui";
import type { Lang } from "@/lib/cv/types";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaRegister() {
  useEffect(() => {
    // inside the Android APK (native WebView bridge) the service worker is
    // unnecessary and can break asset loading — skip it
    const inApk = typeof window !== "undefined" &&
      (Boolean((window as { AndroidBridge?: unknown }).AndroidBridge) ||
        window.location.protocol === "file:");
    if ("serviceWorker" in navigator && !inApk) {
      const onLoad = () => {
        // relative path → works both at host root (APK) and under /CV/app/ (GitHub Pages)
        navigator.serviceWorker.register("sw.js").catch(() => {});
      };
      if (document.readyState === "complete") onLoad();
      else {
        window.addEventListener("load", onLoad);
        return () => window.removeEventListener("load", onLoad);
      }
    }
  }, []);
  return null;
}

export function InstallButton({ lang }: { lang: Lang }) {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!promptEvent || installed) return null;

  return (
    <Button size="sm" variant="outline" className="gap-1.5" onClick={async () => {
      await promptEvent.prompt();
      const res = await promptEvent.userChoice;
      if (res.outcome === "accepted") setInstalled(true);
      setPromptEvent(null);
    }}>
      <Download className="h-4 w-4" />
      <span className="hidden sm:inline">{dict.installApp[lang]}</span>
    </Button>
  );
}

export function OfflineBadge({ lang }: { lang: Lang }) {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const upd = () => setOnline(navigator.onLine);
    upd();
    window.addEventListener("online", upd);
    window.addEventListener("offline", upd);
    return () => {
      window.removeEventListener("online", upd);
      window.removeEventListener("offline", upd);
    };
  }, []);
  if (online) return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
      <WifiOff className="h-3.5 w-3.5" />{dict.offlineReady[lang]}
    </span>
  );
}
