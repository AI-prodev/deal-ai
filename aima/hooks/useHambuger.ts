import {
  Dispatch,
  RefObject,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { useViewportSize, useClickOutside } from "@mantine/hooks";

type HookReturn = [
  RefObject<HTMLDivElement>,
  boolean,
  boolean,
  Dispatch<SetStateAction<boolean>>,
];

export const useHamburger = (): HookReturn => {
  const { width } = useViewportSize();
  const [showHamburger, setShowHamburger] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => setShowMenu(false));

  useEffect(() => {
    setShowHamburger(width <= 768);
  }, [width]);

  return [ref, showHamburger, showMenu, setShowMenu];
};
