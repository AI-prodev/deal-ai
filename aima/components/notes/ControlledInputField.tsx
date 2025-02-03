import React, { useState, useRef, useEffect } from "react";
type InputProps = React.ComponentProps<"input">;

const ControlledInputField = React.forwardRef(
  ({ value, onChange, type, ...rest }: any, ref) => {
    const [cursor, setCursor] = useState(null);

    useEffect(() => {
      (ref as any)?.current?.setSelectionRange(cursor, cursor);
    }, [ref, cursor, value]);

    const handleChange = (e: any) => {
      setCursor(e.target.selectionStart);
      onChange?.(e);
    };

    return (
      <>
        {type === "textarea" ? (
          <textarea ref={ref} value={value} onChange={handleChange} {...rest} />
        ) : (
          <input ref={ref} value={value} onChange={handleChange} {...rest} />
        )}
      </>
    );
  }
);

export default ControlledInputField;
