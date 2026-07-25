import { Button } from "@/components/ui/Button";

export default function ServerError() {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface p-6">
      <h1 className="text-2xl font-semibold">Server error</h1>
      <p className="mt-2 text-secondary">The request could not be completed.</p>
      <Button className="mt-5" onClick={() => window.location.reload()}>Reload</Button>
    </div>
  );
}
