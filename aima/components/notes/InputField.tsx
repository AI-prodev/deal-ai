import Rodal from "rodal";
import "rodal/lib/rodal.css";
import { useEffect, useState } from "react";
import { useDetectClickOutside } from "react-detect-click-outside";
import {
  NoteDataContext,
  NoteDataManager,
  noteDefaultBgColor,
} from "@/utils/note";
import Note from "./Note";
import { INote } from "@/interfaces/INote";
import { randomLinkID } from "@/utils/note";

interface Props {
  add: Function;
  noteType: string; // 'text' or 'checklist'
}

const InputField = (props: Props) => {
  const [note, setNote] = useState<INote | null>(null);
  const [willFocus, setWillFocus] = useState(false);
  const [showModal, setShowNote] = useState(false);
  const [willCloseNote, setWillCloseNote] = useState(false);
  // const ref = useDetectClickOutside({
  //     onTriggered: () => handleClickOutside(),
  // });

  useEffect(() => {
    if (showModal) {
      setNote({
        ...NoteDataManager.generateTemplateNote(),
        contentType: props.noteType === "text" ? "description" : "checklist",
        title: "",
        description: "",
      });
      setWillFocus(true);
    }
  }, [showModal]);

  const handleClose = () => {
    if (showModal && note) {
      setWillCloseNote(true);
    }
  };
  const closeNote = (newNote: INote) => {
    setShowNote(false);
    setWillCloseNote(false);

    // check if empty note
    NoteDataManager.init(newNote as any);
    if (NoteDataManager.isEmptyNote()) {
      setNote(null);
      return;
    }

    props.add(newNote);
    setNote(null);
  };
  const updateNoteState = (noteIn: INote) => {
    setNote(noteIn);
  };

  return (
    <div className="flex flex-col w-72 m-auto border rounded">
      {showModal && note && (
        <div className="shadow-xl">
          <NoteDataContext.Provider
            value={{
              updateNote: updateNoteState,
            }}
          >
            <Rodal
              visible={showModal}
              onClose={handleClose as any}
              className="bg-transparent p-0"
            >
              <Note
                mode="create"
                note={note as any}
                userRole="owner"
                willFocus={willFocus as Boolean}
                addNoteToField={handleClose}
                shouldProvideUpdate={willCloseNote}
                callbackAfterProvide={closeNote}
              />
            </Rodal>
          </NoteDataContext.Provider>
        </div>
      )}
      <button
        onClick={() => setShowNote(true)}
        className={`px-5 py-2 bg-white shadow-xl`}
      >
        {props.noteType === "text" ? "+ Sticky Note" : "+ To-do List"}
      </button>
    </div>
  );
};

export default InputField;
