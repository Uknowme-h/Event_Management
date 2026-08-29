import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { Loader } from "@/components/ui/Loader";

export function ProtectedRoute() {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === "booting") return <Loader />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  return <Outlet />;
}
