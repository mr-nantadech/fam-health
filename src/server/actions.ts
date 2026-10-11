"use server";

import { randomUUID } from "crypto";
import { InputError } from "@/lib/parse";
import {
  parseAllergy,
  parseCondition,
  parseDmHt,
  parseMedication,
  parseMember,
  parseVaccine,
  parseVisit,
  parseVital,
} from "@/lib/parse";
import { loadStore, updateStore } from "@/lib/store";
import type {
  ActionResult,
  AllergyInput,
  ConditionInput,
  DmHtInput,
  MedicationInput,
  MemberInput,
  Store,
  VaccineInput,
  VisitInput,
  VitalInput,
} from "@/types/health";

async function commit(
  mutator: (draft: Store) => { createdId?: string } | void,
): Promise<ActionResult> {
  try {
    let createdId: string | undefined;
    const data = await updateStore((draft) => {
      const extra = mutator(draft);
      createdId = extra?.createdId;
    });
    return { ok: true, data, createdId };
  } catch (error) {
    if (error instanceof InputError) return { ok: false, error: error.message };
    console.error(error);
    return { ok: false, error: "บันทึกไม่สำเร็จ" };
  }
}

function requireMember(draft: Store, memberId: string) {
  if (!draft.members.some((member) => member.id === memberId)) {
    throw new InputError("ไม่พบสมาชิก");
  }
}

export async function getHealthStore(): Promise<ActionResult> {
  try {
    return { ok: true, data: await loadStore() };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "โหลดข้อมูลไม่สำเร็จ" };
  }
}

export async function createMember(input: MemberInput): Promise<ActionResult> {
  return commit((draft) => {
    const id = randomUUID();
    const now = new Date().toISOString();
    draft.members.push({
      ...parseMember(input),
      id,
      createdAt: now,
      updatedAt: now,
    });
    return { createdId: id };
  });
}

export async function updateMember(
  id: string,
  input: MemberInput,
): Promise<ActionResult> {
  return commit((draft) => {
    const index = draft.members.findIndex((member) => member.id === id);
    if (index < 0) throw new InputError("ไม่พบสมาชิก");
    const current = draft.members[index];
    draft.members[index] = {
      ...current,
      ...parseMember(input),
      updatedAt: new Date().toISOString(),
    };
  });
}

export async function deleteMember(id: string): Promise<ActionResult> {
  return commit((draft) => {
    if (!draft.members.some((member) => member.id === id)) {
      throw new InputError("ไม่พบสมาชิก");
    }
    draft.members = draft.members.filter((member) => member.id !== id);
    draft.conditions = draft.conditions.filter((item) => item.memberId !== id);
    draft.allergies = draft.allergies.filter((item) => item.memberId !== id);
    draft.medications = draft.medications.filter(
      (item) => item.memberId !== id,
    );
    draft.vaccines = draft.vaccines.filter((item) => item.memberId !== id);
    draft.visits = draft.visits.filter((item) => item.memberId !== id);
    draft.vitals = draft.vitals.filter((item) => item.memberId !== id);
    draft.dmHtEntries = draft.dmHtEntries.filter(
      (item) => item.memberId !== id,
    );
  });
}

export async function createCondition(
  memberId: string,
  input: ConditionInput,
): Promise<ActionResult> {
  return commit((draft) => {
    requireMember(draft, memberId);
    const id = randomUUID();
    draft.conditions.push({ ...parseCondition(input), id, memberId });
    return { createdId: id };
  });
}

export async function updateCondition(
  id: string,
  input: ConditionInput,
): Promise<ActionResult> {
  return commit((draft) => {
    const index = draft.conditions.findIndex((item) => item.id === id);
    if (index < 0) throw new InputError("ไม่พบรายการ");
    draft.conditions[index] = {
      ...parseCondition(input),
      id,
      memberId: draft.conditions[index].memberId,
    };
  });
}

export async function deleteCondition(id: string): Promise<ActionResult> {
  return commit((draft) => {
    if (!draft.conditions.some((item) => item.id === id))
      throw new InputError("ไม่พบรายการ");
    draft.conditions = draft.conditions.filter((item) => item.id !== id);
  });
}

export async function createAllergy(
  memberId: string,
  input: AllergyInput,
): Promise<ActionResult> {
  return commit((draft) => {
    requireMember(draft, memberId);
    const id = randomUUID();
    draft.allergies.push({ ...parseAllergy(input), id, memberId });
    return { createdId: id };
  });
}

export async function updateAllergy(
  id: string,
  input: AllergyInput,
): Promise<ActionResult> {
  return commit((draft) => {
    const index = draft.allergies.findIndex((item) => item.id === id);
    if (index < 0) throw new InputError("ไม่พบรายการ");
    draft.allergies[index] = {
      ...parseAllergy(input),
      id,
      memberId: draft.allergies[index].memberId,
    };
  });
}

export async function deleteAllergy(id: string): Promise<ActionResult> {
  return commit((draft) => {
    if (!draft.allergies.some((item) => item.id === id))
      throw new InputError("ไม่พบรายการ");
    draft.allergies = draft.allergies.filter((item) => item.id !== id);
  });
}

export async function createMedication(
  memberId: string,
  input: MedicationInput,
): Promise<ActionResult> {
  return commit((draft) => {
    requireMember(draft, memberId);
    const id = randomUUID();
    draft.medications.push({ ...parseMedication(input), id, memberId });
    return { createdId: id };
  });
}

export async function updateMedication(
  id: string,
  input: MedicationInput,
): Promise<ActionResult> {
  return commit((draft) => {
    const index = draft.medications.findIndex((item) => item.id === id);
    if (index < 0) throw new InputError("ไม่พบรายการ");
    draft.medications[index] = {
      ...parseMedication(input),
      id,
      memberId: draft.medications[index].memberId,
    };
  });
}

export async function deleteMedication(id: string): Promise<ActionResult> {
  return commit((draft) => {
    if (!draft.medications.some((item) => item.id === id))
      throw new InputError("ไม่พบรายการ");
    draft.medications = draft.medications.filter((item) => item.id !== id);
  });
}

export async function createVaccine(
  memberId: string,
  input: VaccineInput,
): Promise<ActionResult> {
  return commit((draft) => {
    requireMember(draft, memberId);
    const id = randomUUID();
    draft.vaccines.push({ ...parseVaccine(input), id, memberId });
    return { createdId: id };
  });
}

export async function updateVaccine(
  id: string,
  input: VaccineInput,
): Promise<ActionResult> {
  return commit((draft) => {
    const index = draft.vaccines.findIndex((item) => item.id === id);
    if (index < 0) throw new InputError("ไม่พบรายการ");
    draft.vaccines[index] = {
      ...parseVaccine(input),
      id,
      memberId: draft.vaccines[index].memberId,
    };
  });
}

export async function deleteVaccine(id: string): Promise<ActionResult> {
  return commit((draft) => {
    if (!draft.vaccines.some((item) => item.id === id))
      throw new InputError("ไม่พบรายการ");
    draft.vaccines = draft.vaccines.filter((item) => item.id !== id);
  });
}

export async function createVisit(
  memberId: string,
  input: VisitInput,
): Promise<ActionResult> {
  return commit((draft) => {
    requireMember(draft, memberId);
    const id = randomUUID();
    draft.visits.push({ ...parseVisit(input), id, memberId });
    return { createdId: id };
  });
}

export async function updateVisit(
  id: string,
  input: VisitInput,
): Promise<ActionResult> {
  return commit((draft) => {
    const index = draft.visits.findIndex((item) => item.id === id);
    if (index < 0) throw new InputError("ไม่พบรายการ");
    draft.visits[index] = {
      ...parseVisit(input),
      id,
      memberId: draft.visits[index].memberId,
    };
  });
}

export async function deleteVisit(id: string): Promise<ActionResult> {
  return commit((draft) => {
    if (!draft.visits.some((item) => item.id === id))
      throw new InputError("ไม่พบรายการ");
    draft.visits = draft.visits.filter((item) => item.id !== id);
  });
}

export async function createVital(
  memberId: string,
  input: VitalInput,
): Promise<ActionResult> {
  return commit((draft) => {
    requireMember(draft, memberId);
    const id = randomUUID();
    draft.vitals.push({ ...parseVital(input), id, memberId });
    return { createdId: id };
  });
}

export async function updateVital(
  id: string,
  input: VitalInput,
): Promise<ActionResult> {
  return commit((draft) => {
    const index = draft.vitals.findIndex((item) => item.id === id);
    if (index < 0) throw new InputError("ไม่พบรายการ");
    draft.vitals[index] = {
      ...parseVital(input),
      id,
      memberId: draft.vitals[index].memberId,
    };
  });
}

export async function deleteVital(id: string): Promise<ActionResult> {
  return commit((draft) => {
    if (!draft.vitals.some((item) => item.id === id))
      throw new InputError("ไม่พบรายการ");
    draft.vitals = draft.vitals.filter((item) => item.id !== id);
  });
}

export async function createDmHtEntry(
  memberId: string,
  input: DmHtInput,
): Promise<ActionResult> {
  return commit((draft) => {
    requireMember(draft, memberId);
    const id = randomUUID();
    draft.dmHtEntries.push({ ...parseDmHt(input), id, memberId });
    return { createdId: id };
  });
}

export async function updateDmHtEntry(
  id: string,
  input: DmHtInput,
): Promise<ActionResult> {
  return commit((draft) => {
    const index = draft.dmHtEntries.findIndex((item) => item.id === id);
    if (index < 0) throw new InputError("ไม่พบรายการ");
    draft.dmHtEntries[index] = {
      ...parseDmHt(input),
      id,
      memberId: draft.dmHtEntries[index].memberId,
    };
  });
}

export async function deleteDmHtEntry(id: string): Promise<ActionResult> {
  return commit((draft) => {
    if (!draft.dmHtEntries.some((item) => item.id === id)) {
      throw new InputError("ไม่พบรายการ");
    }
    draft.dmHtEntries = draft.dmHtEntries.filter((item) => item.id !== id);
  });
}
