import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";

export function TableToolbar({ search, onSearch, action }: { search: string; onSearch: (value: string) => void; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative block w-full sm:max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-3 text-muted" size={18} />
        <Input aria-label="Search table" className="pl-10" value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search" />
      </div>
      {action}
    </div>
  );
}
