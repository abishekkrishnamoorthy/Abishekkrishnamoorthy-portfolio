import { X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useState } from "react";

export function TagInput({ value, onChange, max = 8 }: { value: string[]; onChange: (next: string[]) => void; max?: number }) {
  const [draft, setDraft] = useState("");
  const commit = () => {
    const tag = draft.trim();
    if (!tag || value.includes(tag) || value.length >= max) return;
    onChange([...value, tag]);
    setDraft("");
  };
  return (
    <div className="rounded-md border border-border-subtle bg-surface p-2">
      <div className="mb-2 flex flex-wrap gap-2">
        {value.map((tag) => (
          <Badge key={tag}>
            <span className="inline-flex items-center gap-1">
              {tag}
              <button type="button" aria-label={`Remove ${tag}`} onClick={() => onChange(value.filter((item) => item !== tag))}>
                <X size={12} />
              </button>
            </span>
          </Badge>
        ))}
      </div>
      <Input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            commit();
          }
          if (event.key === "Backspace" && !draft) onChange(value.slice(0, -1));
        }}
        onBlur={commit}
        placeholder="Type and press Enter"
      />
    </div>
  );
}
