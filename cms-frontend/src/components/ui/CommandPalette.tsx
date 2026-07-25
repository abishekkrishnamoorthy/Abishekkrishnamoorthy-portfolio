import { useNavigate } from "react-router-dom";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { navGroups } from "@/components/layout/navigation";
import { useUiStore } from "@/stores/uiStore";
import { useState } from "react";

export function CommandPalette() {
  const open = useUiStore((state) => state.commandPaletteOpen);
  const setOpen = useUiStore((state) => state.setCommandPaletteOpen);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const items = navGroups.flatMap((group) => group.items).filter((item) => item.label.toLowerCase().includes(search.toLowerCase()));
  return (
    <Modal open={open} onOpenChange={setOpen} title="Command Palette">
      <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Jump to..." />
      <div className="mt-3 grid gap-1">
        {items.map((item) => (
          <button key={item.path} type="button" className="flex min-h-11 items-center gap-3 rounded-md px-3 text-left text-sm hover:bg-surface-hover" onClick={() => { navigate(item.path); setOpen(false); }}>
            <item.icon size={18} /> {item.label}
          </button>
        ))}
      </div>
    </Modal>
  );
}
