import { create } from "zustand";

export interface Toast {
    id: string;
    type: "success" | "error" | "info" | "warning";
    message: string;
    duration?: number;
}

interface UIState {
    // Modals
    activeModal: string | null;
    modalData: Record<string, unknown>;

    // Sidebar
    sidebarOpen: boolean;

    // Toasts
    toasts: Toast[];

    // Loading states
    globalLoading: boolean;

    // Actions
    openModal: (id: string, data?: Record<string, unknown>) => void;
    closeModal: () => void;
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    addToast: (toast: Omit<Toast, "id">) => void;
    removeToast: (id: string) => void;
    setGlobalLoading: (loading: boolean) => void;
}

let toastId = 0;

export const useUIStore = create<UIState>()((set, get) => ({
    activeModal: null,
    modalData: {},
    sidebarOpen: false,
    toasts: [],
    globalLoading: false,

    openModal: (id, data = {}) => set({ activeModal: id, modalData: data }),
    closeModal: () => set({ activeModal: null, modalData: {} }),
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

    addToast: (toast) => {
        const id = `toast-${++toastId}`;
        const newToast = { ...toast, id, duration: toast.duration ?? 5000 };
        set((state) => ({ toasts: [...state.toasts, newToast] }));

        // Auto remove after duration
        if (newToast.duration > 0) {
            setTimeout(() => {
                get().removeToast(id);
            }, newToast.duration);
        }
    },

    removeToast: (id) => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    },

    setGlobalLoading: (globalLoading) => set({ globalLoading }),
}));
