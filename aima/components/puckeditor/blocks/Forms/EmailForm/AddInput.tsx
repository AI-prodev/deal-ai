import { Checkbox, FormControlLabel } from "@mui/material";
import { ChangeEvent } from "react";

const AddInput = (props: any) => {
  const { field, name, value, onChange } = props;
  const { label } = field;

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    onChange(event?.target?.checked);
  };

  return (
    <FormControlLabel
      control={
        <Checkbox
          onChange={handleChange}
          sx={{ color: "#ababab" }}
          checked={value}
        />
      }
      name={name}
      label={label}
    />
  );
};

export default AddInput;
