import { useEffect, useState, useContext } from "react";
import { INote } from "@/interfaces/INote";
import Note from "./Note";
import { NoteDataContext } from "@/utils/note";

interface Props {
  userRole: string;
  visible: Boolean;
}

const Archives = (props: Props) => {
  const {
    archives,
    setArchives,
  }: {
    archives: INote[];
    setArchives: Function;
  } = useContext(NoteDataContext);

  return (
    <div
      className="archives-area flex flex-wrap justify-center sm:justify-normal gap-2 w-full"
      style={{ display: props.visible ? "flex" : "none" }}
    >
      {archives.map((archive, index) => (
        <Note
          mode="view"
          key={`archive-${index}`}
          note={archive}
          userRole={props.userRole}
        />
      ))}
    </div>
  );
};

export default Archives;
