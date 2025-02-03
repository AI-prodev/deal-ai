import { ShadowPicker } from "react-shadow-picker";
import { ChangeEvent } from "react";

const PuckShadowPicker = (props: any) => {
  const { name, value, onChange } = props;

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    onChange(event?.target?.value);
  };

  return (
    <div>
      <input
        className="form-input !bg-white !border-[#9e9e9e] !text-[#5a5a5a] !py-2.5 !px-[15px] mb-3"
        defaultValue={value}
        name={name}
        value={value}
        onChange={handleChange}
      />
      <ShadowPicker
        className="!h-[260px]"
        value={value}
        onChange={newColour => onChange(newColour)}
      />
    </div>
  );
};

export default PuckShadowPicker;
