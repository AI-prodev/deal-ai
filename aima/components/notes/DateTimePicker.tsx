import { useState, useContext } from "react";
import ReactDateTimePicker from "react-datetime-picker";
import { useDetectClickOutside } from "react-detect-click-outside";
import "react-datetime-picker/dist/DateTimePicker.css";
import "react-calendar/dist/Calendar.css";
import "react-clock/dist/Clock.css";
import { NoteLevelContext } from "@/utils/note";

interface Props {
  visible: Boolean;
  setshowDateTimePicker: Function;
}

const DateTimePicker = (props: Props) => {
  const { setRemindDatetime }: { setRemindDatetime: Function } =
    useContext(NoteLevelContext);
  const ref = useDetectClickOutside({
    onTriggered: () => handleClickOutside(),
  });
  const [datetime, setDatetime] = useState(new Date());

  const handleClickOutside = () => {
    if (props.visible) {
      props.setshowDateTimePicker(false);
      setRemindDatetime && setRemindDatetime(datetime);
    }
  };

  return (
    <div
      style={{ display: props.visible ? "block" : "none" }}
      className="datetime-picker absolute z-10"
      ref={ref}
    >
      <ReactDateTimePicker
        onChange={setDatetime as any}
        value={datetime}
        calendarClassName="border-none rounded shadow-2xl"
        className="w-max bg-white rounded shadow-xl"
      />
    </div>
  );
};

export default DateTimePicker;
