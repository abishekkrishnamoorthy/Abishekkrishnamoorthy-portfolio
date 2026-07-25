"use client";

import { Footer } from "@/components/layout/Footer";
import { AssistantModal } from "@/components/assistant/AssistantModal";
import { MobileNavDrawer } from "@/components/layout/MobileNavDrawer";
import { Navbar } from "@/components/layout/Navbar";
import { NavigationProvider } from "@/context/NavigationContext";
import { useProfile } from "@/hooks/useProfile";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const profile = useProfile();
  return (
    <NavigationProvider>
      <Navbar profile={profile.data} />
      <MobileNavDrawer profile={profile.data} />
      {children}
      <Footer profile={profile.data} />
      <AssistantModal profile={profile.data} />
    </NavigationProvider>
  );
}
