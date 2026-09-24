import { useCallback, useState } from "react";

export function useConfirm() {
  const [confirm, setConfirm] = useState(null);

  const ask = useCallback((title, body, yesLabel) => {
    return new Promise((resolve) => {
      const done = (v) => {
        setConfirm(null);
        resolve(v);
      };
      setConfirm({ title, body, yesLabel, onYes: () => done(true), onNo: () => done(false) });
    });
  }, []);

  return { confirm, ask };
}
