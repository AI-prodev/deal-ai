import { FC, useState } from "react";
import {
  Select,
  MenuItem,
  SelectChangeEvent,
  InputLabel,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { FieldLabel } from "@measured/puck";

const theme = createTheme({
  palette: {
    mode: "light",
  },
});

interface IPuckSelectProps {
  options: { label: string; value: string }[];
  label: string;
  value: any;
  name: string;
  onChange: (value: any) => void;
}

const PuckSelect: FC<IPuckSelectProps> = ({
  label,
  options,
  value,
  name,
  onChange,
}) => {
  const handleChange = (event: SelectChangeEvent) => {
    if (value?.[name]) {
      onChange({ ...value, [name]: event?.target?.value });
    } else {
      onChange(event?.target?.value);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <FieldLabel label={label}>
        <Select
          value={value?.[name]}
          onChange={handleChange}
          fullWidth
          size="small"
        >
          {options?.length > 0 &&
            options?.map(({ value, label }) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
        </Select>
      </FieldLabel>
    </ThemeProvider>
  );
};

export default PuckSelect;
