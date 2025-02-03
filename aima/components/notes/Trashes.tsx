import { useEffect, useState, useContext } from "react";
import { INote } from "@/interfaces/INote";
import Note from "./Note";
import { NoteDataContext } from "@/utils/note";

interface Props {
  userRole: string;
  visible: Boolean;
}

const Trashes = (props: Props) => {
  const {
    trashes,
    setTrashes,
  }: {
    trashes: INote[];
    setTrashes: Function;
  } = useContext(NoteDataContext);

  return (
    <div
      className="trashes-area flex flex-wrap justify-center sm:justify-normal gap-2 w-full"
      style={{ display: props.visible ? "flex" : "none" }}
    >
      {trashes.map((trash, index) => (
        <Note
          mode="view"
          key={`trash-${index}`}
          note={trash}
          userRole={props.userRole}
        />
      ))}
    </div>
  );
};

export default Trashes;
