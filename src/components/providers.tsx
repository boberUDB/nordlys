"use client";

import { SettingsProvider } from "@/lib/settings-context";
import { LoadingScreen } from "@/components/loading-screen";
import { SceneRoot } from "@/components/scene/scene-root";
import { SmoothScroll } from "@/components/smooth-scroll";
import { ScrollProgress } from "@/components/scroll-progress";
import { SoundFx } from "@/components/sound-fx";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <LoadingScreen />
      <SceneRoot />
      <SmoothScroll />
      <ScrollProgress />
      <SoundFx />
      {children}
    </SettingsProvider>
  );
}
