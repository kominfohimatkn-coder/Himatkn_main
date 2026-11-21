"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { Check, TriangleAlert } from "lucide-react";

type ToastType = "ok" | "error";
type ToastItem = { id: number; message: string; type: ToastType };

const ToastContext = createContext<(message: string, type?: ToastType) => void>(
  () => {},
);

/** Notifikasi singkat di kanan atas, mengikuti `.toasts` + `toast()` di Design/admin. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, type: ToastType = "ok") => {
    const id = Date.now() + Math.random();
    setItems((current) => [...current, { id, message, type }]);
    window.setTimeout(() => {
      setItems((current) => current.filter((item) => item.id !== id));
    }, 3400);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        aria-live="polite"
        className="fixed top-[76px] right-5 z-80 grid gap-2 max-[640px]:top-[72px] max-[640px]:right-3 max-[640px]:left-3"
      >
        {items.map((item) => (
          <div
            key={item.id}
            role={item.type === "error" ? "alert" : "status"}
            className={`flex max-w-[380px] min-w-[260px] items-center gap-2.5 rounded-[6px] px-3.5 py-3 text-[13px] text-white shadow-[0_14px_34px_rgba(6,38,27,0.25)] transition duration-300 starting:-translate-y-2 starting:opacity-0 max-[640px]:max-w-none [&_svg]:size-[18px] [&_svg]:shrink-0 ${
              item.type === "error"
                ? "bg-[#4a1a10] [&_svg]:text-[#f2b8a8]"
                : "bg-green-950 [&_svg]:text-mint"
            }`}
          >
            {item.type === "error" ? (
              <TriangleAlert aria-hidden="true" />
            ) : (
              <Check aria-hidden="true" />
            )}
            <span>{item.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}