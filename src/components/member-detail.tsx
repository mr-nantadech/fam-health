"use client";

import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useHealth } from "@/components/health-provider";
import { MemberDialog } from "@/components/member-dialog";
import { RecordList } from "@/components/record-list";
import {
  AllergyDialog,
  ConditionDialog,
  MedicationDialog,
  VaccineDialog,
  VisitDialog,
  VitalDialog,
} from "@/components/record-dialogs";
import {
  ageFromBirth,
  allergyKindLabel,
  allergySeverityLabel,
  avatarColor,
  bloodLabel,
  compareDateDesc,
  conditionStatusLabel,
  formatThaiDate,
  genderLabel,
  initials,
  vitalSummary,
} from "@/lib/format";
import {
  deleteAllergy,
  deleteCondition,
  deleteMedication,
  deleteMember,
  deleteVaccine,
  deleteVisit,
  deleteVital,
} from "@/server/actions";
import type {
  Allergy,
  Condition,
  Medication,
  Vaccine,
  Visit,
  Vital,
} from "@/types/health";

type DeleteJob = {
  title: string;
  body: string;
  action: () => Promise<boolean>;
};

export function MemberDetail({ memberId }: { memberId: string }) {
  const router = useRouter();
  const { store, run } = useHealth();
  const member = store.members.find((item) => item.id === memberId);
  const [tab, setTab] = useState(0);
  const [editMember, setEditMember] = useState(false);
  const [deleteMemberOpen, setDeleteMemberOpen] = useState(false);
  const [conditionEditor, setConditionEditor] = useState<
    Condition | null | undefined
  >(undefined);
  const [allergyEditor, setAllergyEditor] = useState<
    Allergy | null | undefined
  >(undefined);
  const [medicationEditor, setMedicationEditor] = useState<
    Medication | null | undefined
  >(undefined);
  const [vaccineEditor, setVaccineEditor] = useState<
    Vaccine | null | undefined
  >(undefined);
  const [visitEditor, setVisitEditor] = useState<Visit | null | undefined>(
    undefined,
  );
  const [vitalEditor, setVitalEditor] = useState<Vital | null | undefined>(
    undefined,
  );
  const [pendingDelete, setPendingDelete] = useState<DeleteJob | null>(null);

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

  const conditions = store.conditions
    .filter((item) => item.memberId === member.id)
    .sort(
      (a, b) =>
        Number(a.status === "resolved") - Number(b.status === "resolved"),
    );
  const allergies = store.allergies.filter(
    (item) => item.memberId === member.id,
  );
  const medications = store.medications
    .filter((item) => item.memberId === member.id)
    .sort((a, b) => Number(!a.active) - Number(!b.active));
  const vaccines = store.vaccines
    .filter((item) => item.memberId === member.id)
    .sort((a, b) => compareDateDesc(a.date, b.date));
  const visits = store.visits
    .filter((item) => item.memberId === member.id)
    .sort((a, b) => compareDateDesc(a.date, b.date));
  const vitals = store.vitals
    .filter((item) => item.memberId === member.id)
    .sort((a, b) => compareDateDesc(a.date, b.date));
  const severe = allergies.filter((item) => item.severity === "severe");
  const age = ageFromBirth(member.birthDate);

  function askDelete(
    title: string,
    body: string,
    action: () => Promise<{ ok: boolean } | null>,
  ) {
    setPendingDelete({
      title,
      body,
      action: async () => {
        const result = await action();
        if (result?.ok) setPendingDelete(null);
        return Boolean(result?.ok);
      },
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: avatarColor(member.name),
              fontSize: 24,
            }}
          >
            {initials(member.name)}
          </Avatar>
          <div>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {member.name}
              {member.nickname ? ` (${member.nickname})` : ""}
            </Typography>
            <Typography color="text.secondary">
              {member.relationship} · {genderLabel(member.gender)}
              {age ? ` · ${age}` : ""}
            </Typography>
            <div className="mt-2 flex flex-wrap gap-1">
              {member.bloodType !== "unknown" ? (
                <Chip
                  size="small"
                  color="primary"
                  label={`กรุ๊ป ${bloodLabel(member.bloodType)}`}
                />
              ) : null}
              <Chip
                size="small"
                label={`โรค ${conditions.filter((item) => item.status !== "resolved").length}`}
              />
              <Chip
                size="small"
                label={`ยา ${medications.filter((item) => item.active).length}`}
              />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outlined"
            startIcon={<EditOutlinedIcon />}
            onClick={() => setEditMember(true)}
          >
            แก้ไข
          </Button>
          <Button
            color="error"
            variant="outlined"
            startIcon={<DeleteOutlineIcon />}
            onClick={() => setDeleteMemberOpen(true)}
          >
            ลบ
          </Button>
        </div>
      </div>

      {severe.length > 0 ? (
        <Alert severity="error">
          แพ้รุนแรง: {severe.map((item) => item.substance).join(", ")}
        </Alert>
      ) : null}

      <Tabs
        value={tab}
        onChange={(_event, value: number) => setTab(value)}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="ข้อมูล" />
        <Tab label={`โรค (${conditions.length})`} />
        <Tab label={`แพ้ (${allergies.length})`} />
        <Tab label={`ยา (${medications.length})`} />
        <Tab label={`วัคซีน (${vaccines.length})`} />
        <Tab label={`พบแพทย์ (${visits.length})`} />
        <Tab label={`สัญญาณชีพ (${vitals.length})`} />
      </Tabs>

      {tab === 0 ? (
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Info
            label="วันเกิด"
            value={member.birthDate ? formatThaiDate(member.birthDate) : "—"}
          />
          <Info label="เบอร์โทร" value={member.phone || "—"} />
          <Info label="กรุ๊ปเลือด" value={bloodLabel(member.bloodType)} />
          <Info label="บันทึก" value={member.note || "—"} />
        </dl>
      ) : null}

      {tab === 1 ? (
        <Section title="โรคประจำตัว" onAdd={() => setConditionEditor(null)}>
          <RecordList
            items={conditions}
            empty="ยังไม่บันทึกโรคประจำตัว"
            onEdit={setConditionEditor}
            onDelete={(item) =>
              askDelete("ลบโรคประจำตัว", `ลบ ${item.name}?`, () =>
                run(() => deleteCondition(item.id), "ลบแล้ว"),
              )
            }
            render={(item) => (
              <>
                <Typography sx={{ fontWeight: 700 }}>{item.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {conditionStatusLabel(item.status)}
                  {item.diagnosedOn
                    ? ` · วินิจฉัย ${formatThaiDate(item.diagnosedOn)}`
                    : ""}
                </Typography>
                {item.note ? (
                  <Typography variant="body2">{item.note}</Typography>
                ) : null}
              </>
            )}
          />
        </Section>
      ) : null}

      {tab === 2 ? (
        <Section title="สิ่งที่แพ้" onAdd={() => setAllergyEditor(null)}>
          <RecordList
            items={allergies}
            empty="ยังไม่บันทึกรายการแพ้"
            onEdit={setAllergyEditor}
            onDelete={(item) =>
              askDelete("ลบรายการแพ้", `ลบ ${item.substance}?`, () =>
                run(() => deleteAllergy(item.id), "ลบแล้ว"),
              )
            }
            render={(item) => (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <Typography sx={{ fontWeight: 700 }}>
                    {item.substance}
                  </Typography>
                  <Chip
                    size="small"
                    color={
                      item.severity === "severe"
                        ? "error"
                        : item.severity === "moderate"
                          ? "warning"
                          : "default"
                    }
                    label={allergySeverityLabel(item.severity)}
                  />
                </div>
                <Typography variant="body2" color="text.secondary">
                  {allergyKindLabel(item.kind)}
                  {item.reaction ? ` · ${item.reaction}` : ""}
                </Typography>
              </>
            )}
          />
        </Section>
      ) : null}

      {tab === 3 ? (
        <Section title="ยาที่ใช้" onAdd={() => setMedicationEditor(null)}>
          <RecordList
            items={medications}
            empty="ยังไม่บันทึกยา"
            onEdit={setMedicationEditor}
            onDelete={(item) =>
              askDelete("ลบยา", `ลบ ${item.name}?`, () =>
                run(() => deleteMedication(item.id), "ลบแล้ว"),
              )
            }
            render={(item) => (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <Typography sx={{ fontWeight: 700 }}>{item.name}</Typography>
                  <Chip
                    size="small"
                    color={item.active ? "primary" : "default"}
                    label={item.active ? "ใช้อยู่" : "หยุดแล้ว"}
                  />
                </div>
                <Typography variant="body2" color="text.secondary">
                  {[item.dose, item.frequency].filter(Boolean).join(" · ") ||
                    "ไม่ระบุขนาด"}
                  {item.startDate
                    ? ` · เริ่ม ${formatThaiDate(item.startDate)}`
                    : ""}
                </Typography>
                {item.note ? (
                  <Typography variant="body2">{item.note}</Typography>
                ) : null}
              </>
            )}
          />
        </Section>
      ) : null}

      {tab === 4 ? (
        <Section title="วัคซีน" onAdd={() => setVaccineEditor(null)}>
          <RecordList
            items={vaccines}
            empty="ยังไม่บันทึกวัคซีน"
            onEdit={setVaccineEditor}
            onDelete={(item) =>
              askDelete("ลบวัคซีน", `ลบ ${item.name}?`, () =>
                run(() => deleteVaccine(item.id), "ลบแล้ว"),
              )
            }
            render={(item) => (
              <>
                <Typography sx={{ fontWeight: 700 }}>
                  {item.name}
                  {item.doseLabel ? ` · ${item.doseLabel}` : ""}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatThaiDate(item.date)}
                  {item.place ? ` · ${item.place}` : ""}
                  {item.nextDue
                    ? ` · นัดถัดไป ${formatThaiDate(item.nextDue)}`
                    : ""}
                </Typography>
              </>
            )}
          />
        </Section>
      ) : null}

      {tab === 5 ? (
        <Section title="การพบแพทย์" onAdd={() => setVisitEditor(null)}>
          <RecordList
            items={visits}
            empty="ยังไม่บันทึกการพบแพทย์"
            onEdit={setVisitEditor}
            onDelete={(item) =>
              askDelete(
                "ลบการพบแพทย์",
                `ลบรายการวันที่ ${formatThaiDate(item.date)}?`,
                () => run(() => deleteVisit(item.id), "ลบแล้ว"),
              )
            }
            render={(item) => (
              <>
                <Typography sx={{ fontWeight: 700 }}>{item.reason}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatThaiDate(item.date)}
                  {item.place ? ` · ${item.place}` : ""}
                  {item.diagnosis ? ` · ${item.diagnosis}` : ""}
                </Typography>
                {item.note ? (
                  <Typography variant="body2">{item.note}</Typography>
                ) : null}
              </>
            )}
          />
        </Section>
      ) : null}

      {tab === 6 ? (
        <Section title="สัญญาณชีพ" onAdd={() => setVitalEditor(null)}>
          <RecordList
            items={vitals}
            empty="ยังไม่บันทึกสัญญาณชีพ"
            onEdit={setVitalEditor}
            onDelete={(item) =>
              askDelete(
                "ลบสัญญาณชีพ",
                `ลบรายการวันที่ ${formatThaiDate(item.date)}?`,
                () => run(() => deleteVital(item.id), "ลบแล้ว"),
              )
            }
            render={(item) => (
              <>
                <Typography sx={{ fontWeight: 700 }}>
                  {formatThaiDate(item.date)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {vitalSummary(item)}
                </Typography>
                {item.note ? (
                  <Typography variant="body2">{item.note}</Typography>
                ) : null}
              </>
            )}
          />
        </Section>
      ) : null}

      {editMember ? (
        <MemberDialog
          key={member.updatedAt}
          open
          member={member}
          onClose={() => setEditMember(false)}
        />
      ) : null}
      {conditionEditor !== undefined ? (
        <ConditionDialog
          key={conditionEditor?.id ?? "new-condition"}
          open
          memberId={member.id}
          initial={conditionEditor}
          onClose={() => setConditionEditor(undefined)}
        />
      ) : null}
      {allergyEditor !== undefined ? (
        <AllergyDialog
          key={allergyEditor?.id ?? "new-allergy"}
          open
          memberId={member.id}
          initial={allergyEditor}
          onClose={() => setAllergyEditor(undefined)}
        />
      ) : null}
      {medicationEditor !== undefined ? (
        <MedicationDialog
          key={medicationEditor?.id ?? "new-medication"}
          open
          memberId={member.id}
          initial={medicationEditor}
          onClose={() => setMedicationEditor(undefined)}
        />
      ) : null}
      {vaccineEditor !== undefined ? (
        <VaccineDialog
          key={vaccineEditor?.id ?? "new-vaccine"}
          open
          memberId={member.id}
          initial={vaccineEditor}
          onClose={() => setVaccineEditor(undefined)}
        />
      ) : null}
      {visitEditor !== undefined ? (
        <VisitDialog
          key={visitEditor?.id ?? "new-visit"}
          open
          memberId={member.id}
          initial={visitEditor}
          onClose={() => setVisitEditor(undefined)}
        />
      ) : null}
      {vitalEditor !== undefined ? (
        <VitalDialog
          key={vitalEditor?.id ?? "new-vital"}
          open
          memberId={member.id}
          initial={vitalEditor}
          onClose={() => setVitalEditor(undefined)}
        />
      ) : null}

      <ConfirmDialog
        open={deleteMemberOpen}
        title="ลบสมาชิก"
        body={`ลบ ${member.name} และประวัติสุขภาพทั้งหมดของคนนี้?`}
        onClose={() => setDeleteMemberOpen(false)}
        onConfirm={async () => {
          const result = await run(
            () => deleteMember(member.id),
            "ลบสมาชิกแล้ว",
          );
          if (!result?.ok) return false;
          router.push("/members");
          return true;
        }}
      />
      <ConfirmDialog
        open={pendingDelete != null}
        title={pendingDelete?.title ?? ""}
        body={pendingDelete?.body ?? ""}
        onClose={() => setPendingDelete(null)}
        onConfirm={async () => (pendingDelete ? pendingDelete.action() : false)}
      />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#e2eae7] bg-white px-4 py-3">
      <dt className="text-sm text-[#5c6f6b]">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap font-medium">{value}</dd>
    </div>
  );
}

function Section({
  title,
  onAdd,
  children,
}: {
  title: string;
  onAdd: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={onAdd}>
          เพิ่ม
        </Button>
      </div>
      {children}
    </section>
  );
}
