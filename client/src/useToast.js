import { useCallback, useRef, useState } from "react";

export function useToast() {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  const hide = useCallback(() => {
    setToast((t) => (t ? { ...t, show: false } : t));
  }, []);

  const show = useCallback((message, action) => {
    clearTimeout(timer.current);
    setToast({ message, action, show: true });
    timer.current = setTimeout(() => hide(), action ? 5000 : 2200);
  }, [hide]);

  return { toast: toast ? { ...toast, hide } : null, show };
}
