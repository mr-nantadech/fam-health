"use client";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useState } from "react";

export function EditorDialog({
  open,
  title,
  onClose,
  onSubmit,
  children,
  maxWidth = "sm",
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: () => Promise<boolean>;
  children: React.ReactNode;
  maxWidth?: "sm" | "md";
}) {
  const [busy, setBusy] = useState(false);

  return (
    <Dialog
      open={open}
      onClose={busy ? undefined : onClose}
      fullWidth
      maxWidth={maxWidth}
    >
      <DialogTitle>{title}</DialogTitle>
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (busy) return;
          setBusy(true);
          void onSubmit().finally(() => setBusy(false));
        }}
      >
        <DialogContent
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            pt: "12px !important",
          }}
        >
          {children}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button type="button" onClick={onClose} disabled={busy}>
            ยกเลิก
          </Button>
          <Button type="submit" variant="contained" disabled={busy}>
            บันทึก
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
