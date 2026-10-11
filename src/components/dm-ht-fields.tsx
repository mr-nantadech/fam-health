"use client";

import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { AppSelect } from "@/components/app-select";
import { DateField } from "@/components/date-field";
import {
  ALCOHOL_OPTIONS,
  SMOKING_OPTIONS,
  type DmHtEntry,
  type DmHtInput,
} from "@/types/health";

const wide = { gridColumn: "1 / -1" };

const zones = [
  { key: "zoneDarkGreen", label: "เขียวแก่", color: "#1b7a32" },
  { key: "zoneYellow", label: "เหลือง", color: "#b8860b" },
  { key: "zoneOrange", label: "ส้ม", color: "#e07a12" },
  { key: "zoneRed", label: "แดง", color: "#c62828" },
  { key: "zoneBlack", label: "ดำ", color: "#222222" },
] as const;

export function blankDmHtInput(): DmHtInput {
  return {
    date: "",
    weightKg: "",
    heightCm: "",
    systolic: "",
    diastolic: "",
    pulse: "",
    waistCm: "",
    fbs: "",
    depress2q: "",
    depress8q: "",
    depress9q: "",
    smoking: "unknown",
    alcohol: "unknown",
    zoneDarkGreen: false,
    zoneYellow: false,
    zoneOrange: false,
    zoneRed: false,
    zoneBlack: false,
    medications: "",
    nextVisit: "",
    examiner: "",
  };
}

export function dmHtInputFromEntry(entry: DmHtEntry): DmHtInput {
  const text = (value: number | null) => (value == null ? "" : String(value));
  return {
    date: entry.date,
    weightKg: text(entry.weightKg),
    heightCm: text(entry.heightCm),
    systolic: text(entry.systolic),
    diastolic: text(entry.diastolic),
    pulse: text(entry.pulse),
    waistCm: text(entry.waistCm),
    fbs: text(entry.fbs),
    depress2q: text(entry.depress2q),
    depress8q: text(entry.depress8q),
    depress9q: text(entry.depress9q),
    smoking: entry.smoking,
    alcohol: entry.alcohol,
    zoneDarkGreen: entry.zoneDarkGreen,
    zoneYellow: entry.zoneYellow,
    zoneOrange: entry.zoneOrange,
    zoneRed: entry.zoneRed,
    zoneBlack: entry.zoneBlack,
    medications: entry.medications,
    nextVisit: entry.nextVisit,
    examiner: entry.examiner,
  };
}

export function DmHtFields({
  form,
  onChange,
}: {
  form: DmHtInput;
  onChange: <K extends keyof DmHtInput>(key: K, value: DmHtInput[K]) => void;
}) {
  return (
    <>
      <DateField
        label="วันที่"
        required
        value={form.date}
        onChange={(value) => onChange("date", value)}
      />
      <TextField
        label="น้ำหนัก (กก.)"
        value={form.weightKg}
        onChange={(event) => onChange("weightKg", event.target.value)}
      />
      <TextField
        label="ส่วนสูง (ซม.)"
        value={form.heightCm}
        onChange={(event) => onChange("heightCm", event.target.value)}
      />
      <TextField
        label="ความดันตัวบน"
        value={form.systolic}
        onChange={(event) => onChange("systolic", event.target.value)}
      />
      <TextField
        label="ความดันตัวล่าง"
        value={form.diastolic}
        onChange={(event) => onChange("diastolic", event.target.value)}
      />
      <TextField
        label="ชีพจร (ครั้ง/นาที)"
        value={form.pulse}
        onChange={(event) => onChange("pulse", event.target.value)}
      />
      <TextField
        label="รอบเอว (ซม.)"
        value={form.waistCm}
        onChange={(event) => onChange("waistCm", event.target.value)}
      />
      <TextField
        label="FBS (mg%)"
        value={form.fbs}
        onChange={(event) => onChange("fbs", event.target.value)}
      />
      <TextField
        label="2Q คะแนน"
        value={form.depress2q}
        onChange={(event) => onChange("depress2q", event.target.value)}
      />
      <TextField
        label="8Q คะแนน"
        value={form.depress8q}
        onChange={(event) => onChange("depress8q", event.target.value)}
      />
      <TextField
        label="9Q คะแนน"
        value={form.depress9q}
        onChange={(event) => onChange("depress9q", event.target.value)}
      />
      <AppSelect
        label="บุหรี่"
        value={form.smoking}
        onChange={(value) => onChange("smoking", value)}
        options={SMOKING_OPTIONS}
      />
      <AppSelect
        label="สุรา"
        value={form.alcohol}
        onChange={(value) => onChange("alcohol", value)}
        options={ALCOHOL_OPTIONS}
      />
      <Box sx={wide}>
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          ประเมิน
        </Typography>
        <div className="flex flex-wrap gap-1">
          {zones.map((zone) => (
            <FormControlLabel
              key={zone.key}
              control={
                <Checkbox
                  checked={form[zone.key]}
                  onChange={(event) => onChange(zone.key, event.target.checked)}
                  sx={{
                    color: zone.color,
                    "&.Mui-checked": { color: zone.color },
                  }}
                />
              }
              label={zone.label}
            />
          ))}
        </div>
      </Box>
      <TextField
        label="รายการยา"
        value={form.medications}
        onChange={(event) => onChange("medications", event.target.value)}
        multiline
        minRows={2}
        sx={wide}
      />
      <DateField
        label="วันนัด"
        value={form.nextVisit}
        onChange={(value) => onChange("nextVisit", value)}
      />
      <TextField
        label="ผู้ตรวจ"
        value={form.examiner}
        onChange={(event) => onChange("examiner", event.target.value)}
      />
    </>
  );
}
