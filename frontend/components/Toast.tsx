"use client";

import { useEffect, useState, createContext, useContext, useCallback, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, X, AlertTriangle, Info } from "lucide-react";

/* ── Types ────────────────────────────────────────────────────────── */

type ToastType = "success" | "error" | "info";

interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextValue {
    toast: (message: string, type?: ToastType) => void;
}

/* ── Context ──────────────────────────────────────────────────────── */

const ToastContext = createContext<ToastContextValue>({
    toast: () => { },
});

export function useToast() {
    return useContext(ToastContext);
}

/* ── Provider ─────────────────────────────────────────────────────── */

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: ToastType = "success") => {
        const id = ++nextId;
        setToasts((prev) => [...prev, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toast: addToast }}>
            {children}
            {/* Toast container — fixed bottom-right */}
            <div className="pointer-events-none fixed right-4 bottom-6 z-[9999] flex flex-col items-end gap-2">
                <AnimatePresence>
                    {toasts.map((t) => (
                        <ToastItem key={t.id} toast={t} onDismiss={removeToast} />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

/* ── Individual toast ─────────────────────────────────────────────── */

const ICONS: Record<ToastType, ReactNode> = {
    success: <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />,
    error: <AlertTriangle className="h-4.5 w-4.5 text-red-500" />,
    info: <Info className="h-4.5 w-4.5 text-blue-500" />,
};

const BG: Record<ToastType, string> = {
    success: "bg-emerald-50 border-emerald-200",
    error: "bg-red-50 border-red-200",
    info: "bg-blue-50 border-blue-200",
};

function ToastItem({
    toast,
    onDismiss,
}: {
    toast: Toast;
    onDismiss: (id: number) => void;
}) {
    useEffect(() => {
        const timer = setTimeout(() => onDismiss(toast.id), 4000);
        return () => clearTimeout(timer);
    }, [toast.id, onDismiss]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className={`pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm ${BG[toast.type]}`}
        >
            {ICONS[toast.type]}
            <span className="text-sm font-medium text-neutral-800">
                {toast.message}
            </span>
            <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                className="ml-2 rounded-lg p-0.5 text-neutral-400 transition hover:text-neutral-600"
            >
                <X className="h-3.5 w-3.5" />
            </button>
        </motion.div>
    );
}
