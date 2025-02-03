import { FieldLabel } from "@measured/puck";
import { HexColorPicker } from "react-colorful";
import { ChangeEvent, FC } from "react";

const colors = [
  "#000000",
  "#ffffff",
  "#FF6900",
  "#FCB900",
  "#7BDCB5",
  "#00D084",
  "#8ED1FC",
  "#0693E3",
  "#ABB8C3",
  "#EB144C",
  "#F78DA7",
  "#9900EF",
];

interface IPuckColourPickerProps {
  value: any;
  name: string;
  onChange: (value: any) => void;
  label?: string;
}

const PuckColourPicker: FC<IPuckColourPickerProps> = ({
  value,
  name,
  onChange,
  label = "",
}) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    if (value?.[name]) {
      onChange({ ...value, [name]: event?.target?.value || "transparent" });
    } else {
      onChange(event?.target?.value);
    }
  };

  const handleChangePicker = (newColour: string): void => {
    if (value?.[name]) {
      onChange({ ...value, [name]: newColour });
    } else {
      onChange(newColour);
    }
  };

  return (
    <FieldLabel label={label}>
      <input
        className="form-input !bg-white !border-[#9e9e9e] !text-[#5a5a5a] !py-2.5 !px-[15px] mb-3"
        style={{ padding: 10, paddingLeft: 0 }}
        defaultValue={value?.[name] || value}
        name={name}
        value={value?.[name] === "transparent" ? "" : value?.[name] || value}
        onChange={handleChange}
      />
      <ul
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 10,
          flexBasis: "100%",
          paddingTop: 10,
          paddingBottom: 10,
          listStyle: "none",
        }}
      >
        {colors.map((c, idx) => {
          return (
            <div key={idx} style={{ display: "block" }}>
              <li
                key={idx}
                onClick={() => handleChangePicker(c)}
                style={{
                  backgroundColor: c,
                  width: 35,
                  height: 35,
                  border: "1px solid rgba(0, 0, 0, 0.5)",
                }}
              ></li>
              {/*<span style={{ fontSize: 7 }}>{c}</span>*/}
            </div>
          );
        })}
      </ul>
      <HexColorPicker
        color={value?.[name] || value}
        onChange={handleChangePicker}
        defaultValue={value?.[name] || value}
        style={{ width: "100%" }}
      />
    </FieldLabel>
  );
};

export default PuckColourPicker;
