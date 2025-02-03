import { useEffect, useState, useContext, useRef, createContext } from "react";
import NoteFooter from "./NoteFooter";
import ControlledInputField from "./ControlledInputField";
import {
  NoteDataContext,
  NoteDataManager,
  NoteLevelContext,
  shareLinkGen,
} from "@/utils/note";
import CheckList from "./CheckList";
import { INote } from "@/interfaces/INote";
import BadgeList from "./NoteBadgeList";

const fixedContentHeight = 247.5; // Set your desired max height here
const inputFieldMinHeight = "200px";

interface Props {
  mode: string; // 'edit', 'view', 'create'
  note: INote;
  userRole: string;
  willFocus?: Boolean;
  onClick?: Function;
  addNoteToField?: Function;
  shouldProvideUpdate?: Boolean;
  callbackAfterProvide?: Function;
  rearrangeGrid?: Function;
}

const Note = (props: Props) => {
  const {
    deleteNotePermanently,
    updateNote,
    updateNoteToServer,
    shouldGetUpdateFromParent,
    setShouldGetUpFrmParnt,
  }: {
    deleteNotePermanently?: Function;
    updateNote: Function;
    updateNoteToServer: Function;
    shouldGetUpdateFromParent: Boolean;
    setShouldGetUpFrmParnt: Function;
  } = useContext(NoteDataContext);
  const [note, setNote] = useState<INote>(props.note);
  const [userInputCount, setUserInputCount] = useState(0);
  const [descriptionFieldHeight, setDescriptionFieldHeight] = useState("auto");
  const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const checklistRef = useRef<HTMLDivElement>(null);
  const [showFullContent, setShowFullContent] = useState(false);
  const [shouldMinHeightAtFirst, setSMHAF] = useState(false);

  const toggleContent = (e: any) => {
    e.stopPropagation();
    setShowFullContent(!showFullContent);
  };

  useEffect(() => {
    // important conditional
    if (userInputCount === 0) return;

    if (props.mode !== "create") {
      const timer = setTimeout(() => {
        // Call your function here if user input event doesn't happen within 2 seconds
        // updateNoteToServer(note.shareId);
        updateNote(note);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [userInputCount]);
  useEffect(() => {
    if (props.note && props.mode === "view") {
      setNote(props.note);
    }
    if (
      props.note &&
      props.mode === "edit" &&
      shouldGetUpdateFromParent &&
      setShouldGetUpFrmParnt &&
      props.note.shareId === note.shareId
    ) {
      setNote(props.note);
      setShouldGetUpFrmParnt(false);
    }
  }, [props.note]);
  useEffect(() => {
    if (props.shouldProvideUpdate && props.callbackAfterProvide) {
      props.callbackAfterProvide(note);
    }
  }, [props.shouldProvideUpdate]);
  useEffect(() => {
    if (props.willFocus && descriptionTextareaRef.current) {
      descriptionTextareaRef.current.focus();
    }
  }, [props.willFocus]);
  useEffect(() => {
    if (descriptionTextareaRef.current) {
      const { scrollHeight } = descriptionTextareaRef.current;
      setDescriptionFieldHeight(`${scrollHeight}px`);
    }
  }, [descriptionTextareaRef.current]);
  useEffect(() => {
    if (descriptionRef.current) {
      const { scrollHeight } = descriptionRef.current;

      if (scrollHeight > fixedContentHeight) {
        setSMHAF(true);
      }
    }
  }, [descriptionRef.current]);
  useEffect(() => {
    if (checklistRef.current) {
      const { scrollHeight } = checklistRef.current;

      if (scrollHeight > fixedContentHeight) {
        setSMHAF(true);
      }
    }
  }, [checklistRef.current]);
  useEffect(() => {
    props.rearrangeGrid && props.rearrangeGrid();
  }, [showFullContent]);

  const setTitle = (title: string) => {
    NoteDataManager.init(note);
    setNote(NoteDataManager.setTitle(title));
    setUserInputCount(userInputCount + 1);
  };
  const setDescription = (description: string) => {
    NoteDataManager.init(note);
    setNote(NoteDataManager.setDescription(description));
    setUserInputCount(userInputCount + 1);
  };

  const deleteNote = async () => {
    NoteDataManager.init(note);
    updateNote(NoteDataManager.deleteNote());
    setNote(NoteDataManager.deleteNote());
  };
  const undeleteNote = async () => {
    NoteDataManager.init(note);
    updateNote(NoteDataManager.undeleteNote());
    setNote(NoteDataManager.deleteNote());
  };
  const deleteNoteForever = () => {
    deleteNotePermanently && deleteNotePermanently(note.shareId);
  };
  const toggleCheckbox = () => {
    NoteDataManager.init(note);
    setNote(NoteDataManager.toggleCheckbox());
    setUserInputCount(userInputCount + 1);
  };
  const checkTodoItem = (index: number) => {
    NoteDataManager.init(note);
    setNote(NoteDataManager.checkTodoItem(index));
    setUserInputCount(userInputCount + 1);
  };
  const unCheckDoneItem = (index: number) => {
    NoteDataManager.init(note);
    setNote(NoteDataManager.unCheckDoneItem(index));
    setUserInputCount(userInputCount + 1);
  };
  const setCheckListDesc = (
    isTodoItem: Boolean,
    index: number,
    description: string
  ) => {
    NoteDataManager.init(note);
    setNote(
      NoteDataManager.setCheckListItemDesc(isTodoItem, index, description)
    );
    setUserInputCount(userInputCount + 1);
  };
  const addTodoItem = (description: string) => {
    NoteDataManager.init(note);
    setNote(NoteDataManager.addTodoItem(description));
    setUserInputCount(userInputCount + 1);
  };
  const deleteCheckListItem = (isTodoItem: Boolean, index: number) => {
    NoteDataManager.init(note);
    setNote(NoteDataManager.deleteCheckListItem(isTodoItem, index));
    setUserInputCount(userInputCount + 1);
  };
  const createNewCheckListItem = (isTodoItem: Boolean, itemIndex: number) => {
    NoteDataManager.init(note);
    setNote(NoteDataManager.addChecklistItemMiddle(isTodoItem, itemIndex));
    setUserInputCount(userInputCount + 1);
  };
  const setNoteBgColor = (color: string) => {
    NoteDataManager.init(note);
    setNote(NoteDataManager.setNoteBgColor(color));
    setUserInputCount(userInputCount + 1);
  };
  const archiveNote = () => {
    NoteDataManager.init(note);
    updateNote(NoteDataManager.archiveNote());
    setNote(NoteDataManager.archiveNote());
  };
  const unarchiveNote = () => {
    NoteDataManager.init(note);
    updateNote(NoteDataManager.unarchiveNote());
    setNote(NoteDataManager.unarchiveNote());
  };
  const setRemindDatetime = (datetime: Date) => {
    NoteDataManager.init(note);
    updateNote(NoteDataManager.setRemindDatetime(datetime));
    setNote(NoteDataManager.setRemindDatetime(datetime));
  };
  const removeRemind = () => {
    NoteDataManager.init(note);
    updateNote(NoteDataManager.removeRemind());
    setNote(NoteDataManager.removeRemind());
  };
  const setNotePassword = (password: string) => {
    NoteDataManager.init(note);
    updateNote(NoteDataManager.setNotePassword(password));
    setNote(NoteDataManager.setNotePassword(password));
  };
  const setNoteShareMode = (shareMode: string) => {
    NoteDataManager.init(note);
    updateNote(NoteDataManager.setNoteShareMode(shareMode));
    setNote(NoteDataManager.setNoteShareMode(shareMode));
  };

  const handleDescriptionFieldChange = (e: any) => {
    setDescription(e.target.value);

    if (descriptionTextareaRef.current) {
      const { scrollHeight } = descriptionTextareaRef.current;
      setDescriptionFieldHeight(`${scrollHeight}px`);
    }
  };

  return (
    <div
      onClick={props.onClick as any}
      className={`note ${props.mode === "edit" || props.mode === "create" || props.userRole === "collaborator" ? "w-full" : "w-72"} flex flex-col justify-between relative p-2 rounded-lg bg-white border shadow`}
      style={{
        backgroundColor: note.bgColor ?? undefined,
        border:
          note.remind?.status === "reminding" ? "2px solid red" : undefined,
      }}
    >
      <div
        className={`flex flex-col p-3 pb-5 relative ${props.note.status === "deleted" ? "[& > *]: text-gray-500" : ""}`}
      >
        {props.mode === "view" && (
          <>
            <div className={`title ${noteHeaderClasses}`}>{note.title}</div>
            {note.contentType === "checklist" && (
              <NoteLevelContext.Provider
                value={{
                  checkTodoItem,
                  unCheckDoneItem,
                  setCheckListDesc,
                  addTodoItem,
                  deleteCheckListItem,
                  bgColor: note.bgColor,
                }}
              >
                <div
                  className="checklist-wrap"
                  style={{
                    height: showFullContent
                      ? "auto"
                      : `${fixedContentHeight}px`,
                    minHeight: fixedContentHeight,
                    overflow: "hidden",
                  }}
                  ref={checklistRef}
                >
                  <CheckList
                    noteMode={props.mode}
                    noteStatus={note.status}
                    todoItems={note.checkList.todoItems}
                    doneItems={note.checkList.doneItems}
                  />
                  {((checklistRef.current &&
                    checklistRef.current.scrollHeight >
                      fixedContentHeight + 5) ||
                    false) && (
                    <>
                      {!showFullContent && (
                        <button
                          onClick={toggleContent}
                          className="absolute bottom-0 left-1/2 -translate-x-1/2 hover:text-violet-600 hover:underline"
                        >
                          Show more
                        </button>
                      )}
                      {showFullContent && (
                        <button
                          onClick={toggleContent}
                          className="absolute bottom-0 left-1/2 -translate-x-1/2 hover:text-violet-600 hover:underline"
                        >
                          Show less
                        </button>
                      )}
                    </>
                  )}
                </div>
              </NoteLevelContext.Provider>
            )}
            {note.contentType === "description" && (
              <>
                <div
                  className="description whitespace-pre-wrap break-words"
                  style={{
                    height: showFullContent
                      ? "auto"
                      : `${fixedContentHeight}px`,
                    overflow: "hidden",
                    minHeight: fixedContentHeight,
                  }}
                  ref={descriptionRef}
                >
                  {note.description}
                </div>
                {((descriptionRef.current &&
                  descriptionRef.current.scrollHeight >
                    fixedContentHeight + 5) ||
                  false) && (
                  <>
                    {!showFullContent && (
                      <button
                        onClick={toggleContent}
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 hover:text-violet-600 hover:underline"
                      >
                        Show more
                      </button>
                    )}
                    {showFullContent && (
                      <button
                        onClick={toggleContent}
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 hover:text-violet-600 hover:underline"
                      >
                        Show less
                      </button>
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}
        {(props.mode === "edit" || props.mode === "create") && (
          <>
            <ControlledInputField
              className={`title ${noteHeaderClasses} border-none focus:outline-none border-b bg-transparent`}
              type="text"
              placeholder={props.mode === "create" ? "Title" : ""}
              value={note.title}
              onChange={(e: any) => setTitle(e.target.value)}
            />
            {note.contentType === "checklist" && (
              <NoteLevelContext.Provider
                value={{
                  checkTodoItem,
                  unCheckDoneItem,
                  setCheckListDesc,
                  addTodoItem,
                  deleteCheckListItem,
                  createNewCheckListItem,
                  bgColor: note.bgColor,
                }}
              >
                <div
                  className="checklist-wrap"
                  style={{ minHeight: inputFieldMinHeight }}
                >
                  <CheckList
                    noteMode={props.mode}
                    noteStatus={note.status}
                    todoItems={note.checkList.todoItems}
                    doneItems={note.checkList.doneItems}
                  />
                </div>
              </NoteLevelContext.Provider>
            )}
            {note.contentType === "description" && (
              <textarea
                className="description border-none focus:outline-none border-b bg-transparent break-words"
                placeholder={props.mode === "create" ? "Description" : ""}
                value={note.description as any}
                style={{
                  height: descriptionFieldHeight,
                  minHeight: inputFieldMinHeight,
                }}
                onChange={handleDescriptionFieldChange as any}
                ref={descriptionTextareaRef}
              />
            )}
          </>
        )}
      </div>

      <NoteLevelContext.Provider
        value={{ removeRemind, remindStatus: note.remind?.status }}
      >
        <BadgeList
          remindDatetime={
            note.remind
              ? new Date(
                  note.remind?.year,
                  note.remind?.month,
                  note.remind?.day,
                  note.remind?.hour,
                  note.remind?.minute
                )
              : undefined
          }
        />
      </NoteLevelContext.Provider>

      <NoteLevelContext.Provider
        value={{
          setNoteBgColor,
          setRemindDatetime,
          addNoteToField: props.addNoteToField,
          setNotePassword: setNotePassword,
        }}
      >
        <NoteFooter
          shareLink={
            note.status === "active"
              ? shareLinkGen(note.shareId, note.shareMode)
              : undefined
          }
          noteStatus={note.status}
          delete={
            note.status !== "deleted" && props.userRole === "owner"
              ? deleteNote
              : undefined
          }
          undelete={
            note.status === "deleted" && props.userRole === "owner"
              ? undeleteNote
              : undefined
          }
          deleteForever={
            note.status === "deleted" && props.userRole === "owner"
              ? deleteNoteForever
              : undefined
          }
          archive={
            note.status !== "active" || props.userRole === "collaborator"
              ? undefined
              : archiveNote
          }
          unarchive={
            note.status !== "archived" || props.userRole === "collaborator"
              ? undefined
              : unarchiveNote
          }
          toggleCheckbox={toggleCheckbox as any}
          shareMode={note.shareMode}
          setShareMode={setNoteShareMode}
          userRole={props.userRole}
          password={note.password as string}
        />
      </NoteLevelContext.Provider>
    </div>
  );
};

const noteHeaderClasses = `text-xl mb-2 h-7`;

export default Note;
