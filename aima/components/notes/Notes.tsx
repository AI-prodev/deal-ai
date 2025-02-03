import { INote } from "@/interfaces/INote";
import Note from "./Note";
import { useEffect, useState, useContext } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { NoteDataContext } from "@/utils/note";
import ModalNote from "./ModalNote";

interface Props {
  userRole: string;
  visible: Boolean;
}

const Notes = (props: Props) => {
  const {
    notes,
    setNotes,
  }: {
    notes: INote[];
    setNotes: Function;
  } = useContext(NoteDataContext);

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = reorder(notes, result.source.index, result.destination.index);
    setNotes(items as any);
  };

  return (
    <div
      className="notes-area"
      style={{ display: props.visible ? "block" : "none" }}
    >
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable" direction="horizontal">
          {provided => (
            <div
              className="container flex flex-wrap gap-2"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {notes.map((note, index) => (
                <DraggableNote
                  key={`${note.shareId}-${index}`}
                  note={note}
                  index={index}
                  userRole={props.userRole}
                />
              ))}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

const DraggableNote = ({ note: note_, index, userRole }: any) => {
  const [note, setNote] = useState(note_);

  useEffect(() => {
    setNote(note_);
  }, [note_]);

  return (
    <Draggable draggableId={note.shareId} index={index}>
      {provided => (
        <div
          className="drag-element w-70 inline-block"
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          {/* <Note
                        key={index}
                        title={note.title}
                        description={note.description}
                        shareId={note.shareId}
                        shareMode={note.shareMode}
                        userRole={userRole}
                    /> */}
          <ModalNote index={index} note={note} userRole={userRole} />
        </div>
      )}
    </Draggable>
  );
};

const reorder = (list: any, startIndex: any, endIndex: any) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

export default Notes;
