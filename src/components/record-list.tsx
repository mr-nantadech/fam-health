"use client";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

export function RecordList<T extends { id: string }>({
  items,
  empty,
  render,
  onEdit,
  onDelete,
}: {
  items: T[];
  empty: string;
  render: (item: T) => React.ReactNode;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
}) {
  if (items.length === 0) {
    return (
      <Paper variant="outlined" sx={{ borderColor: "#e2eae7", px: 2, py: 6 }}>
        <Typography color="text.secondary" align="center">
          {empty}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      variant="outlined"
      sx={{ borderColor: "#e2eae7", overflow: "hidden" }}
    >
      <ul className="divide-y divide-[#e2eae7]">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-2 px-4 py-3">
            <div className="min-w-0 flex-1">{render(item)}</div>
            <IconButton aria-label="แก้ไข" onClick={() => onEdit(item)}>
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
            <IconButton aria-label="ลบ" onClick={() => onDelete(item)}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </li>
        ))}
      </ul>
    </Paper>
  );
}
