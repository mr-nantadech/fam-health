import {
  ALCOHOL_OPTIONS,
  ALLERGY_KINDS,
  ALLERGY_SEVERITIES,
  BLOOD_TYPES,
  CONDITION_STATUSES,
  GENDERS,
  RELATIONSHIPS,
  SMOKING_OPTIONS,
  type Allergy,
  type AllergyInput,
  type Condition,
  type ConditionInput,
  type DmHtEntry,
  type DmHtInput,
  type Medication,
  type MedicationInput,
  type Member,
  type MemberInput,
  type Vaccine,
  type VaccineInput,
  type Visit,
  type VisitInput,
  type Vital,
  type VitalInput,
} from "@/types/health";

export class InputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InputError";
  }
}

function requiredText(value: unknown, label: string, max: number): string {
  if (typeof value !== "string") throw new InputError(`กรุณากรอก${label}`);
  const text = value.trim();
  if (!text) throw new InputError(`กรุณากรอก${label}`);
  if (text.length > max)
    throw new InputError(`${label}ยาวเกิน ${max} ตัวอักษร`);
  return text;
}

function optionalText(value: unknown, label: string, max: number): string {
  if (value == null) return "";
  if (typeof value !== "string") throw new InputError(`${label}ไม่ถูกต้อง`);
  const text = value.trim();
  if (text.length > max)
    throw new InputError(`${label}ยาวเกิน ${max} ตัวอักษร`);
  return text;
}

function optionalDate(value: unknown, label: string): string {
  if (value == null || value === "") return "";
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new InputError(`${label}ไม่ถูกต้อง`);
  }
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new InputError(`${label}ไม่ถูกต้อง`);
  }
  return value;
}

function requiredDate(value: unknown, label: string): string {
  const date = optionalDate(value, label);
  if (!date) throw new InputError(`กรุณากรอก${label}`);
  return date;
}

function oneOf(
  value: unknown,
  allowed: readonly string[],
  label: string,
): string {
  if (typeof value === "string" && allowed.includes(value)) return value;
  throw new InputError(`กรุณาเลือก${label}`);
}

function optionalNumber(
  value: unknown,
  label: string,
  min: number,
  max: number,
): number | null {
  if (value == null || value === "") return null;
  const numeric =
    typeof value === "number" ? value : Number(String(value).trim());
  if (!Number.isFinite(numeric)) throw new InputError(`${label}ต้องเป็นตัวเลข`);
  if (numeric < min || numeric > max) {
    throw new InputError(`${label}ต้องอยู่ระหว่าง ${min} ถึง ${max}`);
  }
  return Math.round(numeric * 10) / 10;
}

function optionalPhone(value: unknown): string {
  const text = optionalText(value, "เบอร์โทร", 20);
  if (text && !/^[0-9+\-\s()]{1,20}$/.test(text)) {
    throw new InputError("เบอร์โทรใช้ได้เฉพาะตัวเลข");
  }
  return text;
}

function orderDates(start: string, end: string, message: string) {
  if (start && end && end < start) throw new InputError(message);
}

export function parseMember(
  input: MemberInput,
): Omit<Member, "id" | "createdAt" | "updatedAt"> {
  const gender = oneOf(
    input.gender,
    GENDERS.map((item) => item.value),
    "เพศ",
  ) as Member["gender"];
  const bloodType = oneOf(
    input.bloodType,
    BLOOD_TYPES.map((item) => item.value),
    "กรุ๊ปเลือด",
  );
  return {
    name: requiredText(input.name, "ชื่อ", 80),
    nickname: optionalText(input.nickname, "ชื่อเล่น", 40),
    relationship: oneOf(input.relationship, RELATIONSHIPS, "ความสัมพันธ์"),
    gender,
    birthDate: optionalDate(input.birthDate, "วันเกิด"),
    bloodType,
    phone: optionalPhone(input.phone),
    note: optionalText(input.note, "บันทึก", 1000),
  };
}

export function parseCondition(
  input: ConditionInput,
): Omit<Condition, "id" | "memberId"> {
  return {
    name: requiredText(input.name, "ชื่อโรค", 120),
    diagnosedOn: optionalDate(input.diagnosedOn, "วันที่วินิจฉัย"),
    status: oneOf(
      input.status,
      CONDITION_STATUSES.map((item) => item.value),
      "สถานะ",
    ) as Condition["status"],
    note: optionalText(input.note, "บันทึก", 1000),
  };
}

export function parseAllergy(
  input: AllergyInput,
): Omit<Allergy, "id" | "memberId"> {
  return {
    substance: requiredText(input.substance, "สิ่งที่แพ้", 120),
    kind: oneOf(
      input.kind,
      ALLERGY_KINDS.map((item) => item.value),
      "ประเภท",
    ) as Allergy["kind"],
    severity: oneOf(
      input.severity,
      ALLERGY_SEVERITIES.map((item) => item.value),
      "ความรุนแรง",
    ) as Allergy["severity"],
    reaction: optionalText(input.reaction, "อาการ", 500),
  };
}

export function parseMedication(
  input: MedicationInput,
): Omit<Medication, "id" | "memberId"> {
  const startDate = optionalDate(input.startDate, "วันเริ่ม");
  const endDate = optionalDate(input.endDate, "วันหยุด");
  orderDates(startDate, endDate, "วันหยุดยาต้องไม่ก่อนวันเริ่ม");
  if (typeof input.active !== "boolean")
    throw new InputError("สถานะยาไม่ถูกต้อง");
  return {
    name: requiredText(input.name, "ชื่อยา", 120),
    dose: optionalText(input.dose, "ขนาดยา", 80),
    frequency: optionalText(input.frequency, "ความถี่", 80),
    startDate,
    endDate,
    active: input.active,
    note: optionalText(input.note, "บันทึก", 1000),
  };
}

export function parseVaccine(
  input: VaccineInput,
): Omit<Vaccine, "id" | "memberId"> {
  return {
    name: requiredText(input.name, "ชื่อวัคซีน", 120),
    date: requiredDate(input.date, "วันที่ฉีด"),
    doseLabel: optionalText(input.doseLabel, "เข็มที่", 40),
    place: optionalText(input.place, "สถานที่", 120),
    nextDue: optionalDate(input.nextDue, "นัดครั้งถัดไป"),
  };
}

export function parseVisit(input: VisitInput): Omit<Visit, "id" | "memberId"> {
  return {
    date: requiredDate(input.date, "วันที่พบแพทย์"),
    place: optionalText(input.place, "สถานพยาบาล", 120),
    reason: requiredText(input.reason, "สาเหตุที่ไป", 200),
    diagnosis: optionalText(input.diagnosis, "การวินิจฉัย", 200),
    note: optionalText(input.note, "บันทึก", 1000),
  };
}

export function parseVital(input: VitalInput): Omit<Vital, "id" | "memberId"> {
  const systolic = optionalNumber(input.systolic, "ความดันตัวบน", 40, 260);
  const diastolic = optionalNumber(input.diastolic, "ความดันตัวล่าง", 20, 180);
  if (systolic != null && diastolic != null && systolic <= diastolic) {
    throw new InputError("ความดันตัวบนต้องมากกว่าตัวล่าง");
  }
  const vital = {
    date: requiredDate(input.date, "วันที่วัด"),
    weightKg: optionalNumber(input.weightKg, "น้ำหนัก", 0.5, 400),
    heightCm: optionalNumber(input.heightCm, "ส่วนสูง", 30, 250),
    systolic,
    diastolic,
    heartRate: optionalNumber(input.heartRate, "ชีพจร", 20, 250),
    temperatureC: optionalNumber(input.temperatureC, "อุณหภูมิ", 30, 45),
    glucoseMgDl: optionalNumber(input.glucoseMgDl, "น้ำตาล", 20, 800),
    note: optionalText(input.note, "บันทึก", 500),
  };
  const hasMeasure = [
    vital.weightKg,
    vital.heightCm,
    vital.systolic,
    vital.diastolic,
    vital.heartRate,
    vital.temperatureC,
    vital.glucoseMgDl,
  ].some((value) => value != null);
  if (!hasMeasure) throw new InputError("กรุณากรอกค่าที่วัดอย่างน้อย 1 ช่อง");
  return vital;
}

function optionalScore(
  value: unknown,
  label: string,
  max: number,
): number | null {
  const score = optionalNumber(value, label, 0, max);
  if (score != null && !Number.isInteger(score)) {
    throw new InputError(`${label}ต้องเป็นจำนวนเต็ม`);
  }
  return score;
}

function flag(value: unknown, label: string): boolean {
  if (typeof value !== "boolean") throw new InputError(`${label}ไม่ถูกต้อง`);
  return value;
}

export function parseDmHt(
  input: DmHtInput,
): Omit<DmHtEntry, "id" | "memberId"> {
  const systolic = optionalNumber(input.systolic, "ความดันตัวบน", 40, 260);
  const diastolic = optionalNumber(input.diastolic, "ความดันตัวล่าง", 20, 180);
  if (systolic != null && diastolic != null && systolic <= diastolic) {
    throw new InputError("ความดันตัวบนต้องมากกว่าตัวล่าง");
  }
  return {
    date: requiredDate(input.date, "วันที่"),
    weightKg: optionalNumber(input.weightKg, "น้ำหนัก", 0.5, 400),
    heightCm: optionalNumber(input.heightCm, "ส่วนสูง", 30, 250),
    systolic,
    diastolic,
    pulse: optionalNumber(input.pulse, "ชีพจร", 20, 250),
    waistCm: optionalNumber(input.waistCm, "รอบเอว", 30, 200),
    fbs: optionalNumber(input.fbs, "FBS", 20, 800),
    depress2q: optionalScore(input.depress2q, "2Q", 2),
    depress8q: optionalScore(input.depress8q, "8Q", 24),
    depress9q: optionalScore(input.depress9q, "9Q", 27),
    smoking: oneOf(
      input.smoking,
      SMOKING_OPTIONS.map((item) => item.value),
      "บุหรี่",
    ),
    alcohol: oneOf(
      input.alcohol,
      ALCOHOL_OPTIONS.map((item) => item.value),
      "สุรา",
    ),
    zoneDarkGreen: flag(input.zoneDarkGreen, "เขียวแก่"),
    zoneYellow: flag(input.zoneYellow, "เหลือง"),
    zoneOrange: flag(input.zoneOrange, "ส้ม"),
    zoneRed: flag(input.zoneRed, "แดง"),
    zoneBlack: flag(input.zoneBlack, "ดำ"),
    medications: optionalText(input.medications, "รายการยา", 1000),
    nextVisit: optionalDate(input.nextVisit, "วันนัด"),
    examiner: optionalText(input.examiner, "ผู้ตรวจ", 80),
  };
}
