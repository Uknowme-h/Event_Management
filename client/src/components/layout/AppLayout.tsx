import { Outlet } from "react-router-dom";
import { Header } from "@/components/layout/Header";

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8F8F8]">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
