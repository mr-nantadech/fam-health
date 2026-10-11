"use client";

import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { useId } from "react";

type Option = { value: string; label: string };

export function AppSelect({
  label,
  value,
  onChange,
  options,
  sx,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly Option[];
  sx?: object;
}) {
  const id = useId();
  return (
    <FormControl fullWidth sx={sx}>
      <InputLabel id={`${id}-label`}>{label}</InputLabel>
      <Select
        labelId={`${id}-label`}
        id={id}
        label={label}
        value={value}
        IconComponent={ArrowDropDownIcon}
        onChange={(event) => onChange(String(event.target.value))}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
