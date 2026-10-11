import {
  ALLERGY_KINDS,
  ALLERGY_SEVERITIES,
  BLOOD_TYPES,
  CONDITION_STATUSES,
  GENDERS,
  RELATIONSHIPS,
  type Member,
  type Vital,
} from "@/types/health";

const THAI_MONTHS = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

const AVATAR_COLORS = ["#0E6B64", "#1D6A8A", "#8A4B2F", "#3F6B4E", "#6B4C7A"];

export function labelOf(
  options: readonly { value: string; label: string }[],
  value: string,
): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function formatThaiDate(iso: string): string {
  if (!iso) return "—";
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day || !THAI_MONTHS[month - 1]) return iso;
  return `${day} ${THAI_MONTHS[month - 1]} ${year + 543}`;
}

export function ageFromBirth(iso: string, today = new Date()): string {
  if (!iso) return "";
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return "";
  let years = today.getFullYear() - year;
  const monthNow = today.getMonth() + 1;
  if (monthNow < month || (monthNow === month && today.getDate() < day)) {
    years -= 1;
  }
  if (years > 0) return `${years} ปี`;
  let months = (today.getFullYear() - year) * 12 + (monthNow - month);
  if (today.getDate() < day) months -= 1;
  return `${Math.max(months, 0)} เดือน`;
}

export function genderLabel(value: string): string {
  return labelOf(GENDERS, value);
}

export function bloodLabel(value: string): string {
  return labelOf(BLOOD_TYPES, value);
}

export function conditionStatusLabel(value: string): string {
  return labelOf(CONDITION_STATUSES, value);
}

export function allergyKindLabel(value: string): string {
  return labelOf(ALLERGY_KINDS, value);
}

export function allergySeverityLabel(value: string): string {
  return labelOf(ALLERGY_SEVERITIES, value);
}

export function initials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  return Array.from(trimmed).slice(0, 2).join("");
}

export function avatarColor(name: string): string {
  const code = Array.from(name).reduce(
    (sum, char) => sum + char.charCodeAt(0),
    0,
  );
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}

export function compareMembers(a: Member, b: Member): number {
  const rank = (relationship: string) => {
    const index = (RELATIONSHIPS as readonly string[]).indexOf(relationship);
    return index < 0 ? RELATIONSHIPS.length : index;
  };
  const byRelationship = rank(a.relationship) - rank(b.relationship);
  if (byRelationship !== 0) return byRelationship;
  return a.name.localeCompare(b.name, "th");
}

export function compareDateDesc(a: string, b: string): number {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return b.localeCompare(a);
}

export function bmi(weightKg: number | null, heightCm: number | null): string {
  if (weightKg == null || heightCm == null || heightCm <= 0) return "";
  const meters = heightCm / 100;
  return (weightKg / (meters * meters)).toFixed(1);
}

export function vitalSummary(item: Vital): string {
  const parts: string[] = [];
  if (item.weightKg != null) parts.push(`${item.weightKg} กก.`);
  if (item.heightCm != null) parts.push(`${item.heightCm} ซม.`);
  const index = bmi(item.weightKg, item.heightCm);
  if (index) parts.push(`BMI ${index}`);
  if (item.systolic != null && item.diastolic != null) {
    parts.push(`${item.systolic}/${item.diastolic} mmHg`);
  } else if (item.systolic != null) {
    parts.push(`ความดัน ${item.systolic} mmHg`);
  }
  if (item.heartRate != null) parts.push(`ชีพจร ${item.heartRate}`);
  if (item.temperatureC != null) parts.push(`${item.temperatureC} °C`);
  if (item.glucoseMgDl != null) parts.push(`น้ำตาล ${item.glucoseMgDl} mg/dL`);
  return parts.join(" · ");
}

export function forMember<T extends { memberId: string }>(
  items: T[],
  memberId: string,
): T[] {
  return items.filter((item) => item.memberId === memberId);
}
