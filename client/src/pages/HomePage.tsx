import { useAuth } from "@/auth/AuthContext";

export function HomePage() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-[#777]">Welcome back</p>
      <h1 className="mt-3 font-mono text-3xl font-medium tracking-tight text-[#111]">
        {user?.name}
      </h1>
      <p className="mt-4 text-sm text-[#777]">
        Events coming in Phase 5.
      </p>
    </div>
  );
}
