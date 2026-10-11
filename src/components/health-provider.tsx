"use client";

import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getHealthStore } from "@/server/actions";
import { emptyStore, type ActionResult, type Store } from "@/types/health";

type Notice = { severity: "success" | "error"; text: string };

type HealthContextValue = {
  store: Store;
  run: (
    action: () => Promise<ActionResult>,
    success?: string,
  ) => Promise<ActionResult | null>;
};

const HealthContext = createContext<HealthContextValue | null>(null);

export function useHealth(): HealthContextValue {
  const value = useContext(HealthContext);
  if (!value) throw new Error("useHealth must be used within HealthProvider");
  return value;
}

export function HealthProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<Store>(emptyStore);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState<Notice | null>(null);

  const load = useCallback(async () => {
    setStatus("loading");
    const result = await getHealthStore();
    if (!result.ok) {
      setLoadError(result.error);
      setStatus("error");
      return;
    }
    setStore(result.data);
    setLoadError("");
    setStatus("ready");
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const run = useCallback(
    async (action: () => Promise<ActionResult>, success = "บันทึกแล้ว") => {
      try {
        const result = await action();
        if (!result.ok) {
          setNotice({ severity: "error", text: result.error });
          return result;
        }
        setStore(result.data);
        setNotice({ severity: "success", text: success });
        return result;
      } catch (error) {
        console.error(error);
        setNotice({ severity: "error", text: "ติดต่อเซิร์ฟเวอร์ไม่สำเร็จ" });
        return null;
      }
    },
    [],
  );

  const value = useMemo(() => ({ store, run }), [store, run]);

  return (
    <HealthContext.Provider value={value}>
      {status === "loading" ? (
        <div className="flex min-h-[50vh] items-center justify-center">
          <CircularProgress />
        </div>
      ) : null}
      {status === "error" ? (
        <div className="mx-auto flex max-w-lg flex-col items-start gap-4 px-4 py-16">
          <Alert severity="error">{loadError}</Alert>
          <Button variant="contained" onClick={() => void load()}>
            ลองใหม่
          </Button>
        </div>
      ) : null}
      {status === "ready" ? children : null}
      <Snackbar
        open={notice != null}
        autoHideDuration={2800}
        onClose={() => setNotice(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={notice?.severity ?? "success"}
          variant="filled"
          onClose={() => setNotice(null)}
        >
          {notice?.text}
        </Alert>
      </Snackbar>
    </HealthContext.Provider>
  );
}
