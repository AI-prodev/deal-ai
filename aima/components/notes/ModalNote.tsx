import { useState, useEffect, useContext } from "react";
import Rodal from "rodal";
import { INote } from "@/interfaces/INote";
import Note from "./Note";
import "rodal/lib/rodal.css";
import { NoteDataContext } from "@/utils/note";

interface Props {
  index: number;
  note: INote;
  userRole: string;
}

const ModalNote = (props: Props) => {
  const [note, setNote]: any = useState(props.note);
  const [showModal, setShowModal] = useState(false);
  const [willCloseModal, setWillCloseModal] = useState(false);
  const { updateNote }: { updateNote: Function } = useContext(NoteDataContext);

  useEffect(() => {
    setNote(props.note);
  }, [props.note]);

  const handleClick = () => {
    setShowModal(true);
  };
  const handleClose = () => {
    setWillCloseModal(true);
  };
  const closeModal = (updatedNote: INote) => {
    setShowModal(false);
    setWillCloseModal(false);
    updateNote(updatedNote);
  };

  return (
    <>
      {
        <Note
          mode="view"
          key={props.index}
          note={note}
          userRole={props.userRole}
          onClick={handleClick}
        />
      }
      {showModal && (
        <Rodal
          visible={showModal}
          onClose={handleClose as any}
          className="bg-transparent p-0"
        >
          <Note
            mode="edit"
            key={props.index}
            note={note}
            userRole={props.userRole}
            shouldProvideUpdate={willCloseModal}
            callbackAfterProvide={closeModal as any}
          />
        </Rodal>
      )}
    </>
  );
};

export default ModalNote;
