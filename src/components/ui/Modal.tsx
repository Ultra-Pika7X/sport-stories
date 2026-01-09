"use client";

import { useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useUIStore } from "@/stores/uiStore";

export interface ModalProps {
    id: string;
    title?: string;
    children: ReactNode;
    size?: "sm" | "md" | "lg" | "xl" | "full";
    showClose?: boolean;
    closeOnBackdrop?: boolean;
    className?: string;
}

const sizeStyles = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-4xl",
};

export function Modal({
    id,
    title,
    children,
    size = "md",
    showClose = true,
    closeOnBackdrop = true,
    className,
}: ModalProps) {
    const { activeModal, closeModal } = useUIStore();
    const isOpen = activeModal === id;

    // Handle escape key
    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeModal();
        };

        document.addEventListener("keydown", handleEscape);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "";
        };
    }, [isOpen, closeModal]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={closeOnBackdrop ? closeModal : undefined}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className={cn(
                            "relative w-full rounded-2xl glass",
                            "border border-white/10 shadow-2xl",
                            sizeStyles[size],
                            className
                        )}
                    >
                        {/* Header */}
                        {(title || showClose) && (
                            <div className="flex items-center justify-between p-5 border-b border-white/10">
                                {title && (
                                    <h2 className="text-lg font-bold">{title}</h2>
                                )}
                                {showClose && (
                                    <button
                                        onClick={closeModal}
                                        className="p-2 -mr-2 rounded-lg text-muted hover:text-foreground hover:bg-white/5 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Body */}
                        <div className="p-5">{children}</div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

// Convenience hook
export function useModal(id: string) {
    const { openModal, closeModal, activeModal, modalData } = useUIStore();

    return {
        isOpen: activeModal === id,
        open: (data?: Record<string, unknown>) => openModal(id, data),
        close: closeModal,
        data: modalData,
    };
}
