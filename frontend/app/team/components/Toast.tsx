"use client";

import { useEffect, useState } from "react";

export interface ToastData {
  id: number;
  message: string;
  type: "success" | "error";
}

interface Props {
  toasts: ToastData[];
  onRemove: (id: number) => void;
}

export default function ToastContainer({ toasts, onRemove }: Props) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 items-end">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: ToastData; onRemove: (id: number) => void }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onRemove(toast.id), 200);
    }, 2800);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium shadow-2xl ${
        exiting ? "toast-exit" : "toast-enter"
      }`}
      style={{
        background: toast.type === "error" ? "#1a0a0a" : "#111111",
        border: `1px solid ${toast.type === "error" ? "#3f1515" : "#2a2a2a"}`,
        color: toast.type === "error" ? "#f87171" : "#ffffff",
        minWidth: "220px",
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{
          background: toast.type === "error" ? "#ef4444" : "#ffffff",
        }}
      />
      {toast.message}
    </div>
  );
}
