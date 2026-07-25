import { Input } from "@/components/ui/Input";
import { slugify } from "@/lib/utils/slugify";

export function SlugInput({ value, onChange, source }: { value: string; onChange: (value: string) => void; source?: string }) {
  return (
    <div className="flex gap-2">
      <Input value={value} onChange={(event) => onChange(slugify(event.target.value))} placeholder="content-slug" />
      {source ? (
        <button type="button" className="min-h-11 rounded-md border border-border-subtle px-3 text-sm" onClick={() => onChange(slugify(source))}>
          Generate
        </button>
      ) : null}
    </div>
  );
}
