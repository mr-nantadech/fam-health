"use client";

import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DmHtFields, dmHtInputFromEntry } from "@/components/dm-ht-fields";
import { EditorDialog } from "@/components/editor-dialog";
import { useHealth } from "@/components/health-provider";
import { compareDateDesc, formatDate, labelOf } from "@/lib/format";
import { deleteDmHtEntry, updateDmHtEntry } from "@/server/actions";
import {
  SMOKING_OPTIONS,
  ALCOHOL_OPTIONS,
  type DmHtEntry,
  type DmHtInput,
} from "@/types/health";

const columnCount = 19;

const headCell = {
  fontWeight: 700,
  textAlign: "center",
  border: "1px solid #cfe0db",
  backgroundColor: "#e7f3f1",
  lineHeight: 1.3,
  px: 1,
  py: 0.75,
  verticalAlign: "middle",
  whiteSpace: "normal",
} as const;

const bodyCell = {
  border: "1px solid #e2eae7",
  textAlign: "center",
  verticalAlign: "top",
  px: 1,
  py: 1,
  whiteSpace: "nowrap",
} as const;

function pair(left: number | null, right: number | null): string {
  if (left == null && right == null) return "—";
  return `${left ?? "—"}/${right ?? "—"}`;
}

function score(value: number | null): string {
  return value == null ? "—" : String(value);
}

function Mark({ on, color }: { on: boolean; color: string }) {
  if (!on) return "—";
  return (
    <Box component="span" sx={{ color, fontWeight: 700 }}>
      ✓
    </Box>
  );
}

export function NotebookTab({
  memberId,
  entries,
  initialBookOpen = false,
}: {
  memberId: string;
  entries: DmHtEntry[];
  initialBookOpen?: boolean;
}) {
  const [bookOpen, setBookOpen] = useState(initialBookOpen);

  if (!bookOpen) {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            สมุดบันทึก
          </Typography>
          <Typography color="text.secondary">
            เลือกสมุดที่ต้องการเปิด แต่ละคนมีได้หลายสมุด
          </Typography>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Paper
            component="button"
            type="button"
            onClick={() => setBookOpen(true)}
            elevation={0}
            sx={{
              p: 2.5,
              textAlign: "left",
              border: "1px solid #e2eae7",
              cursor: "pointer",
              "&:hover": { borderColor: "#0E6B64" },
            }}
          >
            <div className="flex items-start gap-3">
              <MenuBookOutlinedIcon color="primary" />
              <div>
                <Typography sx={{ fontWeight: 700 }}>
                  เบาหวานและความดัน
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  น้ำหนัก ความดัน น้ำตาล การประเมิน ยา และวันนัด
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {entries.length} รายการ
                </Typography>
              </div>
            </div>
          </Paper>
        </div>
      </div>
    );
  }

  return (
    <DmHtBook
      memberId={memberId}
      entries={entries}
      onBack={() => setBookOpen(false)}
    />
  );
}

function DmHtBook({
  memberId,
  entries,
  onBack,
}: {
  memberId: string;
  entries: DmHtEntry[];
  onBack: () => void;
}) {
  const rows = [...entries].sort((a, b) => compareDateDesc(a.date, b.date));
  const [editor, setEditor] = useState<DmHtEntry | null>(null);
  const [pendingDelete, setPendingDelete] = useState<DmHtEntry | null>(null);
  const { run } = useHealth();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button startIcon={<ArrowBackIcon />} onClick={onBack}>
            สมุดทั้งหมด
          </Button>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            สมุดเบาหวานและความดัน
          </Typography>
        </div>
        <Button
          variant="contained"
          component={Link}
          href={`/members/${memberId}/notebook/dm-ht/new`}
          startIcon={<AddIcon />}
        >
          เพิ่มรายการ
        </Button>
      </div>
      <Typography variant="body2" color="text.secondary">
        เลื่อนตารางไปทางขวาเพื่อดูทุกคอลัมน์
      </Typography>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ border: "1px solid #e2eae7", overflowX: "auto" }}
      >
        <Table size="small" sx={{ minWidth: 1480 }}>
          <TableHead>
            <TableRow>
              <TableCell rowSpan={2} sx={headCell}>
                วันที่
              </TableCell>
              <TableCell rowSpan={2} sx={headCell}>
                น้ำหนัก/ ส่วนสูง
              </TableCell>
              <TableCell rowSpan={2} sx={headCell}>
                ความดันโลหิต mmHg
              </TableCell>
              <TableCell rowSpan={2} sx={headCell}>
                ชีพจรครั้ง/นาที
              </TableCell>
              <TableCell rowSpan={2} sx={headCell}>
                รอบเอว (CM)
              </TableCell>
              <TableCell rowSpan={2} sx={headCell}>
                FBS (น้ำตาล) mg%
              </TableCell>
              <TableCell colSpan={3} sx={headCell}>
                ประเมินซึมเศร้า
              </TableCell>
              <TableCell rowSpan={2} sx={headCell}>
                บุหรี่
              </TableCell>
              <TableCell rowSpan={2} sx={headCell}>
                สุรา
              </TableCell>
              <TableCell colSpan={5} sx={headCell}>
                ประเมิน
              </TableCell>
              <TableCell rowSpan={2} sx={headCell}>
                รายการยา
              </TableCell>
              <TableCell rowSpan={2} sx={headCell}>
                วันนัด/ผู้ตรวจ
              </TableCell>
              <TableCell rowSpan={2} sx={headCell}>
                จัดการ
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={headCell}>2Q คะแนน</TableCell>
              <TableCell sx={headCell}>8Q คะแนน</TableCell>
              <TableCell sx={headCell}>9Q คะแนน</TableCell>
              <TableCell sx={headCell}>เขียวแก่</TableCell>
              <TableCell sx={headCell}>เหลือง</TableCell>
              <TableCell sx={headCell}>ส้ม</TableCell>
              <TableCell sx={headCell}>แดง</TableCell>
              <TableCell sx={headCell}>ดำ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columnCount} align="center" sx={{ py: 5 }}>
                  ยังไม่มีรายการในสมุดนี้
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell sx={bodyCell}>{formatDate(row.date)}</TableCell>
                  <TableCell sx={bodyCell}>
                    {pair(row.weightKg, row.heightCm)}
                  </TableCell>
                  <TableCell sx={bodyCell}>
                    {pair(row.systolic, row.diastolic)}
                  </TableCell>
                  <TableCell sx={bodyCell}>{score(row.pulse)}</TableCell>
                  <TableCell sx={bodyCell}>{score(row.waistCm)}</TableCell>
                  <TableCell sx={bodyCell}>{score(row.fbs)}</TableCell>
                  <TableCell sx={bodyCell}>{score(row.depress2q)}</TableCell>
                  <TableCell sx={bodyCell}>{score(row.depress8q)}</TableCell>
                  <TableCell sx={bodyCell}>{score(row.depress9q)}</TableCell>
                  <TableCell sx={bodyCell}>
                    {labelOf(SMOKING_OPTIONS, row.smoking)}
                  </TableCell>
                  <TableCell sx={bodyCell}>
                    {labelOf(ALCOHOL_OPTIONS, row.alcohol)}
                  </TableCell>
                  <TableCell sx={bodyCell}>
                    <Mark on={row.zoneDarkGreen} color="#1b7a32" />
                  </TableCell>
                  <TableCell sx={bodyCell}>
                    <Mark on={row.zoneYellow} color="#b8860b" />
                  </TableCell>
                  <TableCell sx={bodyCell}>
                    <Mark on={row.zoneOrange} color="#e07a12" />
                  </TableCell>
                  <TableCell sx={bodyCell}>
                    <Mark on={row.zoneRed} color="#c62828" />
                  </TableCell>
                  <TableCell sx={bodyCell}>
                    <Mark on={row.zoneBlack} color="#222222" />
                  </TableCell>
                  <TableCell
                    sx={{ ...bodyCell, whiteSpace: "pre-wrap", minWidth: 160 }}
                  >
                    {row.medications || "—"}
                  </TableCell>
                  <TableCell sx={bodyCell}>
                    <div>{row.nextVisit ? formatDate(row.nextVisit) : "—"}</div>
                    {row.examiner ? <div>{row.examiner}</div> : null}
                  </TableCell>
                  <TableCell sx={bodyCell}>
                    <IconButton
                      aria-label="แก้ไข"
                      onClick={() => setEditor(row)}
                    >
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      aria-label="ลบ"
                      onClick={() => setPendingDelete(row)}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {editor ? (
        <DmHtDialog
          key={editor.id}
          open
          initial={editor}
          onClose={() => setEditor(null)}
        />
      ) : null}
      <ConfirmDialog
        open={pendingDelete != null}
        title="ลบรายการในสมุด"
        body={
          pendingDelete
            ? `ลบรายการวันที่ ${formatDate(pendingDelete.date)}?`
            : ""
        }
        onClose={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return false;
          const result = await run(
            () => deleteDmHtEntry(pendingDelete.id),
            "ลบแล้ว",
          );
          if (result?.ok) setPendingDelete(null);
          return Boolean(result?.ok);
        }}
      />
    </div>
  );
}

function DmHtDialog({
  open,
  initial,
  onClose,
}: {
  open: boolean;
  initial: DmHtEntry;
  onClose: () => void;
}) {
  const { run } = useHealth();
  const [form, setForm] = useState<DmHtInput>(() =>
    dmHtInputFromEntry(initial),
  );

  function set<K extends keyof DmHtInput>(key: K, value: DmHtInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <EditorDialog
      open={open}
      maxWidth="md"
      title="แก้ไขรายการสมุด"
      onClose={onClose}
      onSubmit={async () => {
        const result = await run(() => updateDmHtEntry(initial.id, form));
        if (result?.ok) onClose();
        return Boolean(result?.ok);
      }}
    >
      <DmHtFields form={form} onChange={set} />
    </EditorDialog>
  );
}
