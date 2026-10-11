"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { blankDmHtInput, DmHtFields } from "@/components/dm-ht-fields";
import { HealthStatus, useHealth } from "@/components/health-provider";
import { createDmHtEntry } from "@/server/actions";
import type { DmHtInput } from "@/types/health";

export function DmHtNewPage({ memberId }: { memberId: string }) {
  const router = useRouter();
  const { store, run, status } = useHealth();
  const [form, setForm] = useState<DmHtInput>(blankDmHtInput);
  const [busy, setBusy] = useState(false);
  const backHref = `/members/${memberId}?book=dm-ht`;

  if (status !== "ready") return <HealthStatus />;

  const member = store.members.find((item) => item.id === memberId);
  if (!member) {
    return (
      <div className="flex flex-col items-start gap-3">
        <Typography variant="h5">ไม่พบสมาชิก</Typography>
        <Button component={Link} href="/members" variant="contained">
          กลับไปหน้ารายชื่อ
        </Button>
      </div>
    );
  }

  function set<K extends keyof DmHtInput>(key: K, value: DmHtInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Button
          component={Link}
          href={backHref}
          startIcon={<ArrowBackIcon />}
          sx={{ ml: -1, mb: 1 }}
        >
          กลับไปสมุด
        </Button>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          เพิ่มรายการสมุด
        </Typography>
        <Typography color="text.secondary">
          {member.name} · สมุดเบาหวานและความดัน
        </Typography>
      </div>
      <Box
        component="form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (busy) return;
          setBusy(true);
          void run(() => createDmHtEntry(memberId, form)).then((result) => {
            if (result?.ok) {
              router.push(backHref);
              return;
            }
            setBusy(false);
          });
        }}
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" },
          bgcolor: "#fff",
          border: "1px solid #e2eae7",
          borderRadius: 2,
          p: { xs: 2, md: 3 },
        }}
      >
        <DmHtFields form={form} onChange={set} />
        <Box
          sx={{
            gridColumn: "1 / -1",
            display: "flex",
            justifyContent: "flex-end",
            gap: 1,
            pt: 1,
          }}
        >
          <Button component={Link} href={backHref} disabled={busy}>
            ยกเลิก
          </Button>
          <Button type="submit" variant="contained" disabled={busy}>
            บันทึก
          </Button>
        </Box>
      </Box>
    </div>
  );
}
