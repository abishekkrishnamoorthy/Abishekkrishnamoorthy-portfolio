import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas p-6">
      <div className="rounded-lg border border-border-subtle bg-surface p-6 text-center">
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="mt-2 text-secondary">The route does not exist in the CMS.</p>
        <Link to="/dashboard">
          <Button className="mt-5">Back to dashboard</Button>
        </Link>
      </div>
    </main>
  );
}
