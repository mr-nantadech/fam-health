"use client";

import AddIcon from "@mui/icons-material/Add";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { useMemo, useState } from "react";
import { MemberDialog } from "@/components/member-dialog";
import { HealthStatus, useHealth } from "@/components/health-provider";
import {
  ageFromBirth,
  avatarColor,
  compareMembers,
  genderLabel,
  initials,
} from "@/lib/format";

export function MemberList() {
  const { store } = useHealth();
  const [query, setQuery] = useState("");
  const [openMember, setOpenMember] = useState(false);

  const members = useMemo(() => {
    const text = query.trim().toLowerCase();
    return [...store.members]
      .filter((member) => {
        if (!text) return true;
        return [member.name, member.nickname, member.relationship, member.phone]
          .join(" ")
          .toLowerCase()
          .includes(text);
      })
      .sort(compareMembers);
  }, [query, store.members]);

  return (
    <HealthStatus>
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              สมาชิกในบ้าน
            </Typography>
            <Typography color="text.secondary">
              {store.members.length} คน
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

        <TextField
          label="ค้นหาชื่อหรือความสัมพันธ์"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          sx={{ maxWidth: 420 }}
        />

        {members.length === 0 ? (
          <Paper
            sx={{ p: 5, textAlign: "center", border: "1px solid #e2eae7" }}
            elevation={0}
          >
            <Typography>
              {query ? "ไม่พบสมาชิกที่ค้นหา" : "ยังไม่มีสมาชิก"}
            </Typography>
          </Paper>
        ) : (
          <div className="grid gap-3">
            {members.map((member) => {
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
                      border: "1px solid #e2eae7",
                      "&:hover": { borderColor: "#0E6B64" },
                    }}
                    elevation={0}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar sx={{ bgcolor: avatarColor(member.name) }}>
                        {initials(member.name)}
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <Typography sx={{ fontWeight: 700 }}>
                          {member.name}
                          {member.nickname ? ` (${member.nickname})` : ""}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {member.relationship} · {genderLabel(member.gender)}
                          {age ? ` · ${age}` : ""}
                          {member.phone ? ` · ${member.phone}` : ""}
                        </Typography>
                      </div>
                    </div>
                  </Paper>
                </Link>
              );
            })}
          </div>
        )}

        {openMember ? (
          <MemberDialog
            open
            member={null}
            onClose={() => setOpenMember(false)}
          />
        ) : null}
      </div>
    </HealthStatus>
  );
}
