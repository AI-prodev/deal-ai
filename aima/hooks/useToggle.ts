import { MouseEvent, useCallback, useState } from "react";

export const useToggle = (
  init?: boolean
): [boolean, (evt?: MouseEvent<HTMLElement>) => void] => {
  const [value, setValue] = useState(!!init);

  const onToggle = useCallback((evt?: MouseEvent) => {
    if (evt && typeof evt.stopPropagation === "function") {
      evt?.stopPropagation();
    }
    setValue(v => !v);
  }, []);

  return [value, onToggle];
};
