import { useContext, useEffect, useState } from "react";
import { NoteLevelContext } from "@/utils/note";

const gStrong = `bg-red-500 text-white`;
const gGray = `bg-gray-700 text-white opacity-25`;

interface Props {
  remindDatetime?: Date;
}

const NoteBadge = (props: Props) => {
  const {
    removeRemind,
    remindStatus,
  }: { removeRemind: Function; remindStatus: string } =
    useContext(NoteLevelContext);
  const [strong, setStrong] = useState("");

  useEffect(() => {
    if (remindStatus) {
      let style = "";
      remindStatus === "reminding" && (style = gStrong);
      remindStatus === "passed" && (style = gGray);
      remindStatus === "planned" && (style = "");
      setStrong(style);
    }
  }, [remindStatus]);

  const hClick = (e: any) => {
    e.stopPropagation();
  };
  const hClickClose = () => {
    removeRemind && removeRemind();
  };

  return (
    <div
      onClick={hClick}
      className={`note-badge px-2 rounded-full border flex gap-1 ${strong}`}
    >
      {props.remindDatetime &&
        `${props.remindDatetime.toLocaleString("en-US", { month: "short" })} ${props.remindDatetime.getDate()}, ${props.remindDatetime.toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric" })}`}
      <button onClick={hClickClose} className="close rounded-full">
        X
      </button>
    </div>
  );
};

export default NoteBadge;
