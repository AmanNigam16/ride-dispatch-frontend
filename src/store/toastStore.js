import { create } from "zustand";

function createToastId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useToastStore = create((set) => ({
  items: [],
  pushToast: ({ title, description, tone = "brand" }) => {
    const id = createToastId();

    set((state) => ({
      items: [...state.items, { id, title, description, tone }]
    }));

    window.setTimeout(() => {
      set((state) => ({
        items: state.items.filter((item) => item.id !== id)
      }));
    }, 4200);
  },
  dismissToast: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id)
    }))
}));
