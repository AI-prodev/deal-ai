import { useContext } from "react";
import { CirclePicker } from "react-color";
import { useDetectClickOutside } from "react-detect-click-outside";
import { NoteLevelContext } from "@/utils/note";

interface Props {
  visible: Boolean;
  setShowPallete: Function;
}
const ColorPallete = (props: Props) => {
  const { setNoteBgColor }: { setNoteBgColor: Function } =
    useContext(NoteLevelContext);
  const ref = useDetectClickOutside({
    onTriggered: () => handleClickOutside(),
  });

  const handleClickOutside = () => {
    props.setShowPallete(false);
  };
  const handleColorChange = (color: any, e: any) => {
    setNoteBgColor(color.hex);
  };

  return (
    <div
      className={`p-3 pt-5 rounded bg-white shadow-2xl bg-opacity-75 ${props.visible ? "" : "hidden"}`}
      onClick={e => e.stopPropagation()}
      ref={ref}
    >
      <CirclePicker
        colors={[
          "#f44336",
          "#e91e63",
          "#9c27b0",
          "#673ab7",
          "#3f51b5",
          "#2196f3",
          "#03a9f4",
          "#00bcd4",
          "#009688",
          "#4caf50",
          "#8bc34a",
          "#cddc39",
          "#FCEC60",
          "#ffc107",
          "#ff9800",
          "#ff5722",
          "#795548",
          "#607d8b",
        ]}
        onChange={handleColorChange as any}
      />
    </div>
  );
};

export default ColorPallete;
