import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { NavDrawer } from "@/components/layout/NavDrawer";
import { MobileTabBar } from "@/components/layout/MobileTabBar";

export function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar />
      <div className="min-w-0 flex-1 pb-20 lg:pb-0">
        <Navbar />
        <main className="mx-auto w-full max-w-[1280px] px-4 py-5 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
      <NavDrawer />
      <MobileTabBar />
    </div>
  );
}
