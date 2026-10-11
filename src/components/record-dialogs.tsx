"use client";

import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import { useState } from "react";
import { AppSelect } from "@/components/app-select";
import { DateField } from "@/components/date-field";
import { EditorDialog } from "@/components/editor-dialog";
import { useHealth } from "@/components/health-provider";
import {
  createAllergy,
  createCondition,
  createMedication,
  createVaccine,
  createVisit,
  createVital,
  updateAllergy,
  updateCondition,
  updateMedication,
  updateVaccine,
  updateVisit,
  updateVital,
} from "@/server/actions";
import {
  ALLERGY_KINDS,
  ALLERGY_SEVERITIES,
  CONDITION_STATUSES,
  type Allergy,
  type AllergyInput,
  type Condition,
  type ConditionInput,
  type Medication,
  type MedicationInput,
  type Vaccine,
  type VaccineInput,
  type Visit,
  type VisitInput,
  type Vital,
  type VitalInput,
} from "@/types/health";

const wide = { gridColumn: "1 / -1" };

function num(value: number | null | undefined): string {
  return value == null ? "" : String(value);
}

export function ConditionDialog({
  open,
  memberId,
  initial,
  onClose,
}: {
  open: boolean;
  memberId: string;
  initial: Condition | null;
  onClose: () => void;
}) {
  const { run } = useHealth();
  const [form, setForm] = useState<ConditionInput>({
    name: initial?.name ?? "",
    diagnosedOn: initial?.diagnosedOn ?? "",
    status: initial?.status ?? "active",
    note: initial?.note ?? "",
  });

  return (
    <EditorDialog
      open={open}
      title={initial ? "แก้ไขโรคประจำตัว" : "เพิ่มโรคประจำตัว"}
      onClose={onClose}
      onSubmit={async () => {
        const result = await run(() =>
          initial
            ? updateCondition(initial.id, form)
            : createCondition(memberId, form),
        );
        if (result?.ok) onClose();
        return Boolean(result?.ok);
      }}
    >
      <TextField
        label="ชื่อโรค"
        value={form.name}
        onChange={(event) => setForm({ ...form, name: event.target.value })}
        required
        sx={wide}
      />
      <DateField
        label="วันที่วินิจฉัย"
        value={form.diagnosedOn}
        onChange={(diagnosedOn) => setForm({ ...form, diagnosedOn })}
      />
      <AppSelect
        label="สถานะ"
        value={form.status}
        onChange={(status) => setForm({ ...form, status })}
        options={CONDITION_STATUSES}
      />
      <TextField
        label="บันทึก"
        value={form.note}
        onChange={(event) => setForm({ ...form, note: event.target.value })}
        multiline
        minRows={2}
        sx={wide}
      />
    </EditorDialog>
  );
}

export function AllergyDialog({
  open,
  memberId,
  initial,
  onClose,
}: {
  open: boolean;
  memberId: string;
  initial: Allergy | null;
  onClose: () => void;
}) {
  const { run } = useHealth();
  const [form, setForm] = useState<AllergyInput>({
    substance: initial?.substance ?? "",
    kind: initial?.kind ?? "drug",
    severity: initial?.severity ?? "moderate",
    reaction: initial?.reaction ?? "",
  });

  return (
    <EditorDialog
      open={open}
      title={initial ? "แก้ไขรายการแพ้" : "เพิ่มรายการแพ้"}
      onClose={onClose}
      onSubmit={async () => {
        const result = await run(() =>
          initial
            ? updateAllergy(initial.id, form)
            : createAllergy(memberId, form),
        );
        if (result?.ok) onClose();
        return Boolean(result?.ok);
      }}
    >
      <TextField
        label="สิ่งที่แพ้"
        value={form.substance}
        onChange={(event) =>
          setForm({ ...form, substance: event.target.value })
        }
        required
        sx={wide}
      />
      <AppSelect
        label="ประเภท"
        value={form.kind}
        onChange={(kind) => setForm({ ...form, kind })}
        options={ALLERGY_KINDS}
      />
      <AppSelect
        label="ความรุนแรง"
        value={form.severity}
        onChange={(severity) => setForm({ ...form, severity })}
        options={ALLERGY_SEVERITIES}
      />
      <TextField
        label="อาการ"
        value={form.reaction}
        onChange={(event) => setForm({ ...form, reaction: event.target.value })}
        sx={wide}
      />
    </EditorDialog>
  );
}

export function MedicationDialog({
  open,
  memberId,
  initial,
  onClose,
}: {
  open: boolean;
  memberId: string;
  initial: Medication | null;
  onClose: () => void;
}) {
  const { run } = useHealth();
  const [form, setForm] = useState<MedicationInput>({
    name: initial?.name ?? "",
    dose: initial?.dose ?? "",
    frequency: initial?.frequency ?? "",
    startDate: initial?.startDate ?? "",
    endDate: initial?.endDate ?? "",
    active: initial?.active ?? true,
    note: initial?.note ?? "",
  });

  return (
    <EditorDialog
      open={open}
      title={initial ? "แก้ไขยา" : "เพิ่มยา"}
      onClose={onClose}
      onSubmit={async () => {
        const result = await run(() =>
          initial
            ? updateMedication(initial.id, form)
            : createMedication(memberId, form),
        );
        if (result?.ok) onClose();
        return Boolean(result?.ok);
      }}
    >
      <TextField
        label="ชื่อยา"
        value={form.name}
        onChange={(event) => setForm({ ...form, name: event.target.value })}
        required
        sx={wide}
      />
      <TextField
        label="ขนาด"
        value={form.dose}
        onChange={(event) => setForm({ ...form, dose: event.target.value })}
      />
      <TextField
        label="ความถี่"
        value={form.frequency}
        onChange={(event) =>
          setForm({ ...form, frequency: event.target.value })
        }
      />
      <DateField
        label="วันเริ่ม"
        value={form.startDate}
        onChange={(startDate) => setForm({ ...form, startDate })}
      />
      <DateField
        label="วันหยุด"
        value={form.endDate}
        onChange={(endDate) => setForm({ ...form, endDate })}
      />
      <FormControlLabel
        sx={wide}
        control={
          <Switch
            checked={form.active}
            onChange={(event) =>
              setForm({ ...form, active: event.target.checked })
            }
          />
        }
        label="ยังใช้อยู่"
      />
      <TextField
        label="บันทึก"
        value={form.note}
        onChange={(event) => setForm({ ...form, note: event.target.value })}
        multiline
        minRows={2}
        sx={wide}
      />
    </EditorDialog>
  );
}

export function VaccineDialog({
  open,
  memberId,
  initial,
  onClose,
}: {
  open: boolean;
  memberId: string;
  initial: Vaccine | null;
  onClose: () => void;
}) {
  const { run } = useHealth();
  const [form, setForm] = useState<VaccineInput>({
    name: initial?.name ?? "",
    date: initial?.date ?? "",
    doseLabel: initial?.doseLabel ?? "",
    place: initial?.place ?? "",
    nextDue: initial?.nextDue ?? "",
  });

  return (
    <EditorDialog
      open={open}
      title={initial ? "แก้ไขวัคซีน" : "เพิ่มวัคซีน"}
      onClose={onClose}
      onSubmit={async () => {
        const result = await run(() =>
          initial
            ? updateVaccine(initial.id, form)
            : createVaccine(memberId, form),
        );
        if (result?.ok) onClose();
        return Boolean(result?.ok);
      }}
    >
      <TextField
        label="ชื่อวัคซีน"
        value={form.name}
        onChange={(event) => setForm({ ...form, name: event.target.value })}
        required
        sx={wide}
      />
      <DateField
        label="วันที่ฉีด"
        value={form.date}
        onChange={(date) => setForm({ ...form, date })}
        required
      />
      <TextField
        label="เข็มที่"
        value={form.doseLabel}
        onChange={(event) =>
          setForm({ ...form, doseLabel: event.target.value })
        }
      />
      <TextField
        label="สถานที่"
        value={form.place}
        onChange={(event) => setForm({ ...form, place: event.target.value })}
        sx={wide}
      />
      <DateField
        label="นัดครั้งถัดไป"
        value={form.nextDue}
        onChange={(nextDue) => setForm({ ...form, nextDue })}
        sx={wide}
      />
    </EditorDialog>
  );
}

export function VisitDialog({
  open,
  memberId,
  initial,
  onClose,
}: {
  open: boolean;
  memberId: string;
  initial: Visit | null;
  onClose: () => void;
}) {
  const { run } = useHealth();
  const [form, setForm] = useState<VisitInput>({
    date: initial?.date ?? "",
    place: initial?.place ?? "",
    reason: initial?.reason ?? "",
    diagnosis: initial?.diagnosis ?? "",
    note: initial?.note ?? "",
  });

  return (
    <EditorDialog
      open={open}
      title={initial ? "แก้ไขการพบแพทย์" : "เพิ่มการพบแพทย์"}
      onClose={onClose}
      onSubmit={async () => {
        const result = await run(() =>
          initial ? updateVisit(initial.id, form) : createVisit(memberId, form),
        );
        if (result?.ok) onClose();
        return Boolean(result?.ok);
      }}
    >
      <DateField
        label="วันที่"
        value={form.date}
        onChange={(date) => setForm({ ...form, date })}
        required
      />
      <TextField
        label="สถานพยาบาล"
        value={form.place}
        onChange={(event) => setForm({ ...form, place: event.target.value })}
      />
      <TextField
        label="สาเหตุที่ไป"
        value={form.reason}
        onChange={(event) => setForm({ ...form, reason: event.target.value })}
        required
        sx={wide}
      />
      <TextField
        label="การวินิจฉัย"
        value={form.diagnosis}
        onChange={(event) =>
          setForm({ ...form, diagnosis: event.target.value })
        }
        sx={wide}
      />
      <TextField
        label="บันทึก"
        value={form.note}
        onChange={(event) => setForm({ ...form, note: event.target.value })}
        multiline
        minRows={2}
        sx={wide}
      />
    </EditorDialog>
  );
}

export function VitalDialog({
  open,
  memberId,
  initial,
  onClose,
}: {
  open: boolean;
  memberId: string;
  initial: Vital | null;
  onClose: () => void;
}) {
  const { run } = useHealth();
  const [form, setForm] = useState<VitalInput>({
    date: initial?.date ?? "",
    weightKg: num(initial?.weightKg),
    heightCm: num(initial?.heightCm),
    systolic: num(initial?.systolic),
    diastolic: num(initial?.diastolic),
    heartRate: num(initial?.heartRate),
    temperatureC: num(initial?.temperatureC),
    glucoseMgDl: num(initial?.glucoseMgDl),
    note: initial?.note ?? "",
  });

  function set(key: keyof VitalInput, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <EditorDialog
      open={open}
      title={initial ? "แก้ไขสัญญาณชีพ" : "เพิ่มสัญญาณชีพ"}
      onClose={onClose}
      onSubmit={async () => {
        const result = await run(() =>
          initial ? updateVital(initial.id, form) : createVital(memberId, form),
        );
        if (result?.ok) onClose();
        return Boolean(result?.ok);
      }}
    >
      <DateField
        label="วันที่วัด"
        value={form.date}
        onChange={(date) => set("date", date)}
        required
        sx={wide}
      />
      <TextField
        label="น้ำหนัก (กก.)"
        value={form.weightKg}
        onChange={(event) => set("weightKg", event.target.value)}
      />
      <TextField
        label="ส่วนสูง (ซม.)"
        value={form.heightCm}
        onChange={(event) => set("heightCm", event.target.value)}
      />
      <TextField
        label="ความดันตัวบน"
        value={form.systolic}
        onChange={(event) => set("systolic", event.target.value)}
      />
      <TextField
        label="ความดันตัวล่าง"
        value={form.diastolic}
        onChange={(event) => set("diastolic", event.target.value)}
      />
      <TextField
        label="ชีพจร"
        value={form.heartRate}
        onChange={(event) => set("heartRate", event.target.value)}
      />
      <TextField
        label="อุณหภูมิ (°C)"
        value={form.temperatureC}
        onChange={(event) => set("temperatureC", event.target.value)}
      />
      <TextField
        label="น้ำตาล (mg/dL)"
        value={form.glucoseMgDl}
        onChange={(event) => set("glucoseMgDl", event.target.value)}
        sx={wide}
      />
      <TextField
        label="บันทึก"
        value={form.note}
        onChange={(event) => set("note", event.target.value)}
        sx={wide}
      />
    </EditorDialog>
  );
}
