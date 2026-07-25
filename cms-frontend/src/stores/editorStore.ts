import { create } from "zustand";

type EditorState = {
  activeBlockId: string | null;
  setActiveBlockId: (id: string | null) => void;
};

export const useEditorStore = create<EditorState>((set) => ({
  activeBlockId: null,
  setActiveBlockId: (activeBlockId) => set({ activeBlockId }),
}));
