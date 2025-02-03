import { FieldLabel } from "@measured/puck";

export const puckEditorDefaultStyles = {
  background: "white",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "var(--puck-color-grey-8)",
  borderRadius: "4px",
  fontFamily: "inherit",
  fontSize: "14px",
  padding: "12px 15px",
  width: "100%",
};

interface PuckRichTextEditorProps {
  value: any;
  name: string;
  onChange: (value: any) => void;
  field: {
    label: string;
    type: string;
  };
  rows?: number;
}

const PuckRichTextEditor = (props: PuckRichTextEditorProps) => {
  const { value, name, onChange, field, rows } = props;

  const handleChange = (event: any): void => {
    if (value?.[name]) {
      onChange({ ...value, [name]: event?.target?.value });
    } else {
      onChange(event?.target?.value);
    }
  };

  return (
    <FieldLabel label={field.label || ""}>
      <textarea
        style={puckEditorDefaultStyles}
        rows={rows || 5}
        defaultValue={value?.[name] || value}
        name={name}
        value={value?.[name] || value}
        onChange={handleChange}
      />
    </FieldLabel>
  );
};

export default PuckRichTextEditor;
