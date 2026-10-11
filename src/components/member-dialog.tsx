"use client";

import TextField from "@mui/material/TextField";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppSelect } from "@/components/app-select";
import { EditorDialog } from "@/components/editor-dialog";
import { useHealth } from "@/components/health-provider";
import { createMember, updateMember } from "@/server/actions";
import {
  BLOOD_TYPES,
  GENDERS,
  RELATIONSHIPS,
  type Member,
  type MemberInput,
} from "@/types/health";

const wide = { gridColumn: "1 / -1" };

function toInput(member: Member | null): MemberInput {
  return {
    name: member?.name ?? "",
    nickname: member?.nickname ?? "",
    relationship: member?.relationship ?? "ตัวเอง",
    gender: member?.gender ?? "unspecified",
    birthDate: member?.birthDate ?? "",
    bloodType: member?.bloodType ?? "unknown",
    phone: member?.phone ?? "",
    note: member?.note ?? "",
  };
}

export function MemberDialog({
  open,
  member,
  onClose,
}: {
  open: boolean;
  member: Member | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const { run } = useHealth();
  const [form, setForm] = useState<MemberInput>(() => toInput(member));

  function set<K extends keyof MemberInput>(key: K, value: MemberInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <EditorDialog
      open={open}
      title={member ? "แก้ไขสมาชิก" : "เพิ่มสมาชิก"}
      onClose={onClose}
      onSubmit={async () => {
        const result = await run(() =>
          member ? updateMember(member.id, form) : createMember(form),
        );
        if (!result?.ok) return false;
        if (!member && result.createdId)
          router.push(`/members/${result.createdId}`);
        onClose();
        return true;
      }}
    >
      <TextField
        label="ชื่อ"
        value={form.name}
        onChange={(event) => set("name", event.target.value)}
        required
        sx={wide}
      />
      <TextField
        label="ชื่อเล่น"
        value={form.nickname}
        onChange={(event) => set("nickname", event.target.value)}
      />
      <AppSelect
        label="ความสัมพันธ์"
        value={form.relationship}
        onChange={(value) => set("relationship", value)}
        options={RELATIONSHIPS.map((item) => ({ value: item, label: item }))}
      />
      <AppSelect
        label="เพศ"
        value={form.gender}
        onChange={(value) => set("gender", value)}
        options={GENDERS}
      />
      <AppSelect
        label="กรุ๊ปเลือด"
        value={form.bloodType}
        onChange={(value) => set("bloodType", value)}
        options={BLOOD_TYPES}
      />
      <TextField
        label="วันเกิด"
        type="date"
        value={form.birthDate}
        onChange={(event) => set("birthDate", event.target.value)}
        slotProps={{ inputLabel: { shrink: true } }}
      />
      <TextField
        label="เบอร์โทร"
        value={form.phone}
        onChange={(event) => set("phone", event.target.value)}
        sx={wide}
      />
      <TextField
        label="บันทึกเพิ่มเติม"
        value={form.note}
        onChange={(event) => set("note", event.target.value)}
        multiline
        minRows={3}
        sx={wide}
      />
    </EditorDialog>
  );
}
