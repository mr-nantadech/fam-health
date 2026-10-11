export const RELATIONSHIPS = [
  "ตัวเอง",
  "คู่สมรส",
  "บุตร",
  "บิดา",
  "มารดา",
  "พี่น้อง",
  "ปู่",
  "ย่า",
  "ตา",
  "ยาย",
  "หลาน",
  "ญาติ",
  "อื่นๆ",
] as const;

export const GENDERS = [
  { value: "unspecified", label: "ไม่ระบุ" },
  { value: "male", label: "ชาย" },
  { value: "female", label: "หญิง" },
] as const;

export const BLOOD_TYPES = [
  { value: "unknown", label: "ไม่ทราบ" },
  { value: "A", label: "A" },
  { value: "B", label: "B" },
  { value: "AB", label: "AB" },
  { value: "O", label: "O" },
  { value: "A+", label: "A+" },
  { value: "A-", label: "A-" },
  { value: "B+", label: "B+" },
  { value: "B-", label: "B-" },
  { value: "AB+", label: "AB+" },
  { value: "AB-", label: "AB-" },
  { value: "O+", label: "O+" },
  { value: "O-", label: "O-" },
] as const;

export const CONDITION_STATUSES = [
  { value: "active", label: "กำลังดูแล" },
  { value: "monitoring", label: "เฝ้าระวัง" },
  { value: "resolved", label: "หายแล้ว" },
] as const;

export const ALLERGY_KINDS = [
  { value: "drug", label: "ยา" },
  { value: "food", label: "อาหาร" },
  { value: "other", label: "อื่นๆ" },
] as const;

export const ALLERGY_SEVERITIES = [
  { value: "mild", label: "เล็กน้อย" },
  { value: "moderate", label: "ปานกลาง" },
  { value: "severe", label: "รุนแรง" },
] as const;

export type Gender = (typeof GENDERS)[number]["value"];
export type ConditionStatus = (typeof CONDITION_STATUSES)[number]["value"];
export type AllergyKind = (typeof ALLERGY_KINDS)[number]["value"];
export type AllergySeverity = (typeof ALLERGY_SEVERITIES)[number]["value"];

export interface Member {
  id: string;
  name: string;
  nickname: string;
  relationship: string;
  gender: Gender;
  birthDate: string;
  bloodType: string;
  phone: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface Condition {
  id: string;
  memberId: string;
  name: string;
  diagnosedOn: string;
  status: ConditionStatus;
  note: string;
}

export interface Allergy {
  id: string;
  memberId: string;
  substance: string;
  kind: AllergyKind;
  severity: AllergySeverity;
  reaction: string;
}

export interface Medication {
  id: string;
  memberId: string;
  name: string;
  dose: string;
  frequency: string;
  startDate: string;
  endDate: string;
  active: boolean;
  note: string;
}

export interface Vaccine {
  id: string;
  memberId: string;
  name: string;
  date: string;
  doseLabel: string;
  place: string;
  nextDue: string;
}

export interface Visit {
  id: string;
  memberId: string;
  date: string;
  place: string;
  reason: string;
  diagnosis: string;
  note: string;
}

export interface Vital {
  id: string;
  memberId: string;
  date: string;
  weightKg: number | null;
  heightCm: number | null;
  systolic: number | null;
  diastolic: number | null;
  heartRate: number | null;
  temperatureC: number | null;
  glucoseMgDl: number | null;
  note: string;
}

export interface Store {
  members: Member[];
  conditions: Condition[];
  allergies: Allergy[];
  medications: Medication[];
  vaccines: Vaccine[];
  visits: Visit[];
  vitals: Vital[];
}

export type ActionResult =
  { ok: true; data: Store; createdId?: string } | { ok: false; error: string };

export type MemberInput = {
  name: string;
  nickname: string;
  relationship: string;
  gender: string;
  birthDate: string;
  bloodType: string;
  phone: string;
  note: string;
};

export type ConditionInput = {
  name: string;
  diagnosedOn: string;
  status: string;
  note: string;
};

export type AllergyInput = {
  substance: string;
  kind: string;
  severity: string;
  reaction: string;
};

export type MedicationInput = {
  name: string;
  dose: string;
  frequency: string;
  startDate: string;
  endDate: string;
  active: boolean;
  note: string;
};

export type VaccineInput = {
  name: string;
  date: string;
  doseLabel: string;
  place: string;
  nextDue: string;
};

export type VisitInput = {
  date: string;
  place: string;
  reason: string;
  diagnosis: string;
  note: string;
};

export type VitalInput = {
  date: string;
  weightKg: string;
  heightCm: string;
  systolic: string;
  diastolic: string;
  heartRate: string;
  temperatureC: string;
  glucoseMgDl: string;
  note: string;
};

export function emptyStore(): Store {
  return {
    members: [],
    conditions: [],
    allergies: [],
    medications: [],
    vaccines: [],
    visits: [],
    vitals: [],
  };
}
