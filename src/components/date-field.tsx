"use client";

import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField, { type TextFieldProps } from "@mui/material/TextField";
import { useRef, useState } from "react";
import { formatDate } from "@/lib/format";

function toDisplay(iso: string): string {
  if (!iso) return "";
  const shown = formatDate(iso);
  return shown === iso ? "" : shown;
}

function toIso(text: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text);
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return `${match[3]}-${match[2]}-${match[1]}`;
}

function mask(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function DateField({
  label,
  value,
  onChange,
  required,
  sx,
}: {
  label: string;
  value: string;
  onChange: (iso: string) => void;
  required?: boolean;
  sx?: TextFieldProps["sx"];
}) {
  const [text, setText] = useState(() => toDisplay(value));
  const [error, setError] = useState("");
  const [prevValue, setPrevValue] = useState(value);
  const pickerRef = useRef<HTMLInputElement>(null);

  if (value !== prevValue) {
    setPrevValue(value);
    if (value && toIso(text) !== value) {
      setText(toDisplay(value));
      setError("");
    }
  }

  function openCalendar() {
    const picker = pickerRef.current;
    if (!picker) return;
    try {
      picker.showPicker();
    } catch {
      picker.focus();
      picker.click();
    }
  }

  return (
    <TextField
      label={label}
      value={text}
      required={required}
      placeholder="dd/mm/yyyy"
      error={Boolean(error)}
      helperText={error}
      sx={sx}
      onChange={(event) => {
        const next = mask(event.target.value);
        setText(next);
        if (!next) {
          setError("");
          onChange("");
          return;
        }
        const iso = toIso(next);
        if (iso) {
          setError("");
          onChange(iso);
          return;
        }
        setError(next.length === 10 ? "วันที่ไม่ถูกต้อง" : "");
        onChange("");
      }}
      slotProps={{
        htmlInput: { inputMode: "numeric", maxLength: 10 },
        input: {
          endAdornment: (
            <InputAdornment
              position="end"
              sx={{ position: "relative", width: 40, overflow: "hidden" }}
            >
              <IconButton
                type="button"
                edge="end"
                aria-label={`เปิดปฏิทิน ${label}`}
                onClick={openCalendar}
              >
                <CalendarTodayOutlinedIcon
                  sx={{
                    display: "inline-block",
                    width: 20,
                    height: 20,
                    color: "text.secondary",
                  }}
                />
              </IconButton>
              <input
                ref={pickerRef}
                type="date"
                tabIndex={-1}
                aria-hidden="true"
                value={value}
                onChange={(event) => {
                  const iso = event.target.value;
                  setError("");
                  setText(toDisplay(iso));
                  onChange(iso);
                }}
                className="date-field-picker"
              />
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
