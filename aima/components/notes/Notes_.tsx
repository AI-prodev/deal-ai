import { useState, useEffect, useRef, useContext } from "react";
import Note from "./Note";
// import DraggableGrid, { DraggableGridHandle } from "ruuri";
import { DraggableGridHandle } from "ruuri";
import { INote } from "@/interfaces/INote";
import { NoteDataContext } from "@/utils/note";
const DRAG_THRESHOLD = 5;

interface Props {
  shouldUpdateGridVisual: boolean;
}

const Item = ({ key, text, ...props }: any) => {
  return (
    <div key={key} {...props}>
      {text}
    </div>
  );
};

const Notes_ = (props: Props) => {
  const {
    notes,
    setNotes,
    setShowModal,
    setCurrentEditingNote,
  }: {
    notes: INote[];
    setNotes: Function;
    setShowModal: Function;
    setCurrentEditingNote: Function;
  } = useContext(NoteDataContext);
  const ref = useRef<DraggableGridHandle | null>(null);
  const items = [
    { key: "1", text: "zl", size: "s", color: "red" },
    { key: "2", text: "zg", size: "l", color: "blue" },
    { key: "3", text: "nx", size: "l", color: "blue" },
  ];
  const [wasDragged, setWasDragged] = useState(false);
  const [DraggableGrid, setDraggableGrid] = useState<any>(null);
  const [shouldUpdateGridVisual, setShouldUpdateVisual] = useState(false);

  useEffect(() => {
    const load = async () => {
      const DraggableGrid_ = (await import("ruuri")).default;
      setDraggableGrid(DraggableGrid_);
    };
    load();
  }, []);
  useEffect(() => {
    if (shouldUpdateGridVisual) {
      ref.current && ref.current.grid?.refreshItems().layout();
      setShouldUpdateVisual(false);
    }
  }, [shouldUpdateGridVisual]);
  useEffect(() => {
    if (props.shouldUpdateGridVisual) {
      setShouldUpdateVisual(true);
    }
  }, [props.shouldUpdateGridVisual]);
  const handleNoteWrapClick = (e: any, note: INote) => {
    if (!wasDragged) {
      e.stopPropagation();
      setCurrentEditingNote(note);
      setShowModal(true);
      setWasDragged(false);
    }
  };

  return (
    <>
      {/* <button
                onClick={() => {
                    if (ref.current) {
                        ref.current.grid?.refreshItems().layout();
                    }
                }}
            >
                sadfasdfas
            </button> */}
      {DraggableGrid && (
        <DraggableGrid
          // Put your data here
          // Every data item must have a STRING type unique key, such as the id field in data below.
          data={notes.map((note: INote) => ({
            id: `id-${note.shareId}`,
            note: note,
          }))}
          ref={ref}
          renderItem={(itemData: any, index: number) => (
            <div
              key={`key-${itemData.id}`}
              onClick={(e: any) => handleNoteWrapClick(e, itemData.note)}
              className="drag-item p-2"
            >
              <Note
                mode="view"
                note={itemData.note}
                userRole="owner"
                rearrangeGrid={() => {
                  setShouldUpdateVisual(true);
                }}
              />
            </div>
          )}
          // pass grid options
          // see more options docs at https://github.com/haltu/muuri#-grid-options
          dragEnabled
          dragSort
          layout={{
            fillGaps: true,
          }}
          // pass event handlers
          // see more event docs at https://github.com/haltu/muuri#-grid-events
          onSend={(data: any) => {
            // write your code here
          }}
          onDragStart={(data: any, event: any) => {
            // write your code here
          }}
          onDragEnd={(data: any, e: any) => {
            if (e.distance > DRAG_THRESHOLD) {
              setWasDragged(true);
            } else {
              setWasDragged(false);
            }
          }}
        />
      )}
    </>
  );
};

export default Notes_;
