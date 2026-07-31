import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "@/app/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/form/FormField";
import { ApiError } from "@/lib/api/envelope";

const loginSchema = z.object({ email: z.string().email().max(120), password: z.string().min(1).max(128) });

function safeRedirectTarget(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

export default function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const form = useForm<z.infer<typeof loginSchema>>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

  const submit = form.handleSubmit(async (values) => {
    try {
      await auth.login(values.email, values.password);
      navigate(safeRedirectTarget(params.get("redirect")), { replace: true });
    } catch (error: unknown) {
      const message = error instanceof ApiError && error.status === 429
        ? "Too many login attempts. Please wait a minute and try again."
        : error instanceof Error ? error.message : "Login failed";
      form.setError("root", { message });
    }
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <h1 className="text-2xl font-semibold">Portfolio CMS</h1>
        <p className="text-sm text-secondary">Sign in to manage portfolio content.</p>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={submit}>
          <FormField label="Email" error={form.formState.errors.email?.message}>
            <Input type="email" autoComplete="email" {...form.register("email")} />
          </FormField>
          <FormField label="Password" error={form.formState.errors.password?.message}>
            <Input type="password" autoComplete="current-password" {...form.register("password")} />
          </FormField>
          {form.formState.errors.root ? <p className="text-sm text-danger">{form.formState.errors.root.message}</p> : null}
          <Button disabled={form.formState.isSubmitting}>
            <LogIn size={18} /> {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
