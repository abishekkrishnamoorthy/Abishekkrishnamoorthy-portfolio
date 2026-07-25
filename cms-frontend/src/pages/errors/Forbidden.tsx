import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";

export default function Forbidden() {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface p-6">
      <h1 className="text-2xl font-semibold">Permission required</h1>
      <p className="mt-2 text-secondary">Your role cannot access this CMS area.</p>
      <Link to="/dashboard">
        <Button className="mt-5">Back to dashboard</Button>
      </Link>
    </div>
  );
}
