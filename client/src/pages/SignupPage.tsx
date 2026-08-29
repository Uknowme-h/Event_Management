import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { signupSchema } from "@/schemas/auth";
import { ApiError } from "@/api/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";

type FieldErrors = Partial<Record<"name" | "email" | "password", string>>;

export function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
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
    const result = signupSchema.safeParse({ name, email, password });
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
      await signup(name, email, password);
      navigate("/", { replace: true });
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
          // 409 "Email already in use", 500, network errors all surface here
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
          create account
        </h1>

        {formError && <Alert message={formError} className="mb-5" />}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <Input
            label="Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={fieldErrors.name}
            autoComplete="name"
            autoFocus
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
            autoComplete="new-password"
          />
          <Button
            type="submit"
            variant="primary"
            loading={submitting}
            className="mt-2 w-full px-4 py-2.5"
          >
            Create account
          </Button>
        </form>

        <p className="mt-6 text-sm text-[#777]">
          Already have an account?{" "}
          <Link to="/login" className="text-[#111] underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
