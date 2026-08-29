import { Link } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/Button";

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 flex shrink-0 items-center justify-between border-b border-[#DCDCDC] bg-white px-6 py-4">
      <Link
        to="/"
        className="font-mono text-sm font-medium tracking-tight text-[#111] hover:opacity-70"
      >
        Event planning
      </Link>

      {user && (
        <div className="flex items-center gap-5">
          <span className="font-mono text-xs text-[#555]">{user.name}</span>
          <Button variant="ghost" onClick={logout} className="text-xs">
            Logout
          </Button>
        </div>
      )}
    </header>
  );
}
