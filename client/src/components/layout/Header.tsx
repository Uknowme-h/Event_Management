import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/Button";

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="flex shrink-0 items-center justify-between border-b border-[#DCDCDC] bg-white px-6 py-4">
      <span className="font-mono text-sm font-medium tracking-tight text-[#111]">
        Event planning
      </span>

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
