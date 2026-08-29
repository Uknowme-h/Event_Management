import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { loginSchema } from "@/schemas/auth";
import { ApiError } from "@/api/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";

type FieldErrors = Partial<Record<"email" | "password", string>>;

interface LocationState {
  from?: { pathname: string };
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as LocationState | null)?.from?.pathname ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    setFormError(null);

    // Client-side validation first
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const errs: FieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        if (key) errs[key] = issue.message;
      }
      setFieldErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.details?.length) {
          const errs: FieldErrors = {};
          for (const d of err.details) {
            const key = d.path as keyof FieldErrors;
            if (key) errs[key] = d.message;
          }
          setFieldErrors(errs);
        } else {
          setFormError(err.message);
        }
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F8F8] px-4">
      <div className="w-full max-w-md border border-[#DCDCDC] bg-white p-8">
        <h1 className="mb-6 font-mono text-2xl font-medium tracking-tight text-[#111]">
          sign in
        </h1>

        {formError && <Alert message={formError} className="mb-5" />}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
            autoComplete="email"
            autoFocus
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
            autoComplete="current-password"
          />
          <Button
            type="submit"
            variant="primary"
            loading={submitting}
            className="mt-2 w-full px-4 py-2.5"
          >
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-sm text-[#777]">
          No account?{" "}
          <Link to="/signup" className="text-[#111] underline underline-offset-4">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
