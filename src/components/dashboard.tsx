"use client";

import AddIcon from "@mui/icons-material/Add";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { useState } from "react";
import { MemberDialog } from "@/components/member-dialog";
import { useHealth } from "@/components/health-provider";
import {
  ageFromBirth,
  avatarColor,
  bloodLabel,
  compareDateDesc,
  compareMembers,
  formatThaiDate,
  initials,
} from "@/lib/format";

export function Dashboard() {
  const { store } = useHealth();
  const [openMember, setOpenMember] = useState(false);
  const members = [...store.members].sort(compareMembers);
  const activeConditions = store.conditions.filter(
    (item) => item.status !== "resolved",
  );
  const activeMeds = store.medications.filter((item) => item.active);
  const severe = store.allergies.filter((item) => item.severity === "severe");
  const visits = [...store.visits]
    .sort((a, b) => compareDateDesc(a.date, b.date))
    .slice(0, 6);

  const stats = [
    { label: "สมาชิก", value: members.length },
    { label: "โรคที่ยังดูแล", value: activeConditions.length },
    { label: "ยาที่ใช้อยู่", value: activeMeds.length },
    { label: "แพ้รุนแรง", value: severe.length },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            ภาพรวมครอบครัว
          </Typography>
          <Typography color="text.secondary">
            บันทึกประวัติสุขภาพของคนในบ้านไว้ที่เดียวกัน
          </Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenMember(true)}
        >
          เพิ่มสมาชิก
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <Paper
            key={stat.label}
            sx={{ p: 2.5, border: "1px solid #e2eae7" }}
            elevation={0}
          >
            <Typography color="text.secondary" variant="body2">
              {stat.label}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5 }}>
              {stat.value}
            </Typography>
          </Paper>
        ))}
      </div>

      {members.length === 0 ? (
        <Paper
          sx={{ p: 5, textAlign: "center", border: "1px solid #e2eae7" }}
          elevation={0}
        >
          <Typography variant="h6">ยังไม่มีสมาชิกในบ้าน</Typography>
          <Typography color="text.secondary" sx={{ mt: 1, mb: 2 }}>
            เริ่มจากเพิ่มชื่อคนในครอบครัว แล้วค่อยบันทึกโรค ยา
            และประวัติการพบแพทย์
          </Typography>
          <Button variant="contained" onClick={() => setOpenMember(true)}>
            เพิ่มสมาชิกคนแรก
          </Button>
        </Paper>
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          <section className="lg:col-span-3">
            <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 700 }}>
              สมาชิก
            </Typography>
            <div className="grid gap-3 sm:grid-cols-2">
              {members.map((member) => {
                const memberSevere = severe.filter(
                  (item) => item.memberId === member.id,
                );
                const meds = activeMeds.filter(
                  (item) => item.memberId === member.id,
                );
                const age = ageFromBirth(member.birthDate);
                return (
                  <Link
                    key={member.id}
                    href={`/members/${member.id}`}
                    className="text-inherit no-underline"
                  >
                    <Paper
                      sx={{
                        p: 2,
                        height: "100%",
                        border: "1px solid #e2eae7",
                        "&:hover": { borderColor: "#0E6B64" },
                      }}
                      elevation={0}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar sx={{ bgcolor: avatarColor(member.name) }}>
                          {initials(member.name)}
                        </Avatar>
                        <div className="min-w-0">
                          <Typography sx={{ fontWeight: 700 }} noWrap>
                            {member.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            noWrap
                          >
                            {member.relationship}
                            {age ? ` · ${age}` : ""}
                            {member.bloodType !== "unknown"
                              ? ` · กรุ๊ป ${bloodLabel(member.bloodType)}`
                              : ""}
                          </Typography>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {memberSevere.length > 0 ? (
                          <Chip
                            size="small"
                            color="error"
                            label={`แพ้รุนแรง ${memberSevere.length}`}
                          />
                        ) : null}
                        {meds.length > 0 ? (
                          <Chip
                            size="small"
                            label={`ยา ${meds.length} รายการ`}
                          />
                        ) : null}
                      </div>
                    </Paper>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="lg:col-span-2">
            <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 700 }}>
              ต้องระวัง
            </Typography>
            {severe.length === 0 ? (
              <Alert severity="success">ยังไม่มีรายการแพ้ระดับรุนแรง</Alert>
            ) : (
              <div className="flex flex-col gap-2">
                {severe.map((item) => {
                  const member = members.find(
                    (person) => person.id === item.memberId,
                  );
                  return (
                    <Alert
                      key={item.id}
                      severity="error"
                      icon={<WarningAmberIcon />}
                    >
                      {member?.name ?? "สมาชิก"} แพ้{item.substance}
                      {item.reaction ? ` (${item.reaction})` : ""}
                    </Alert>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}

      <section>
        <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 700 }}>
          พบแพทย์ล่าสุด
        </Typography>
        {visits.length === 0 ? (
          <Typography color="text.secondary">
            ยังไม่มีการบันทึกการพบแพทย์
          </Typography>
        ) : (
          <Paper
            sx={{ border: "1px solid #e2eae7", overflow: "hidden" }}
            elevation={0}
          >
            <ul className="divide-y divide-[#e2eae7]">
              {visits.map((visit) => {
                const member = store.members.find(
                  (person) => person.id === visit.memberId,
                );
                return (
                  <li key={visit.id}>
                    <Link
                      href={`/members/${visit.memberId}`}
                      className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3 text-inherit no-underline hover:bg-[#f7fbfa]"
                    >
                      <span>
                        <span className="font-semibold">
                          {member?.name ?? "สมาชิก"}
                        </span>
                        <span className="text-[#5c6f6b]">
                          {" "}
                          · {visit.reason}
                        </span>
                        {visit.place ? (
                          <span className="text-[#5c6f6b]">
                            {" "}
                            · {visit.place}
                          </span>
                        ) : null}
                      </span>
                      <span className="text-sm text-[#5c6f6b]">
                        {formatThaiDate(visit.date)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Paper>
        )}
      </section>

      {openMember ? (
        <MemberDialog open member={null} onClose={() => setOpenMember(false)} />
      ) : null}
    </div>
  );
}
