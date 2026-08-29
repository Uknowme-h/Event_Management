import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { Loader } from "@/components/ui/Loader";

export function GuestRoute() {
  const { status, user } = useAuth();

  if (status === "booting") return <Loader />;
  if (user) return <Navigate to="/" replace />;

  return <Outlet />;
}
