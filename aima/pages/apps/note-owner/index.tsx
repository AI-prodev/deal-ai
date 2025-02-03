import Head from "next/head";
import { createContext } from "react";
import Notes from "@/components/notes/Notes";
import InputField from "@/components/notes/InputField";
import { useEffect, useState } from "react";
import { createNoteApi } from "@/store/features/noteApi";
import { useRouter } from "next/router";
import { NoteDataManager, randomLinkID } from "@/utils/note";
import { INote } from "@/interfaces/INote";
import { IResponse } from "@/interfaces/IResponse";
import { noteSocket, NoteDataContext } from "@/utils/note";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Archives from "@/components/notes/Archives";
import Trashes from "@/components/notes/Trashes";
import Notes_ from "@/components/notes/Notes_";
import Rodal from "rodal";
import "rodal/lib/rodal.css";
import Note from "@/components/notes/Note";
import withAuth from "@/helpers/withAuth";
import { USER_ROLES } from "@/utils/roles";

const iconSize = 5;
const iconColor = "#0000008a";
const gTabs = [
  {
    name: "Notes",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={`w-${iconSize} h-${iconSize}`}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
        />
      </svg>
    ),
  },
  {
    name: "Archived",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={`w-${iconSize} h-${iconSize}`}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
        />
      </svg>
    ),
  },
  {
    name: "Trash",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={`w-${iconSize} h-${iconSize}`}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
        />
      </svg>
    ),
  },
];

const Index = () => {
  const [getNotes] = createNoteApi.useGetNotesMutation();
  const [createNote] = createNoteApi.useCreateNoteMutation();
  const [deleteNote] = createNoteApi.useDeleteNoteMutation();
  const [deleteAll] = createNoteApi.useDeleteAllMutation();
  const [updateNote] = createNoteApi.useUpdateNoteMutation();
  const router = useRouter();
  const currentPath = router.asPath.replace("note-owner", "note-collab");
  const [notes, setNotes] = useState<INote[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [updateChild, setUpdateChild] = useState(false);
  const [updatedNote, setUpdatedNote] = useState<INote | null>(null);
  const [archives, setArchives] = useState<INote[]>([]);
  const [trashes, setTrashes] = useState<INote[]>([]);
  const [allNotes, setAllNotes] = useState<INote[]>([]);
  const [tab, setTab] = useState(gTabs[0].name);
  const [currentEditingNote, setCurrentEditingNote] = useState<INote | null>(
    null
  );
  const [willCloseModal, setWillCloseModal] = useState(false);

  useEffect(() => {
    asyncGetNote();
    noteSocket.initConnectionAsOwner(
      (json: string, notes: INote[], allNotes: INote[]) => {
        const parsed: INote = JSON.parse(json);
        let noteStatusChagned: boolean = false;

        const existingNote = allNotes.find(
          (note: INote) => note.shareId === parsed.shareId
        );

        if (!existingNote) return;

        noteStatusChagned = NoteDataManager.differentStatus(
          existingNote,
          parsed
        );

        if (noteStatusChagned) {
          setAllNotes(
            allNotes.map(note =>
              note.shareId === parsed.shareId ? parsed : note
            )
          );
        } else {
          setNotes(
            notes.map(note => (note.shareId === parsed.shareId ? parsed : note))
          );
        }
        setUpdateChild(true);

        whenGetSocketUpdateShouldDo(parsed, noteStatusChagned);
      }
    );

    import("simple-web-notification").then((module: any) => {
      NoteDataManager.setWebNotifier(module);
      NoteDataManager.startMonitorRemind(
        remindNote as any,
        checkDoneRemindNote as any,
        setAllNotes
      );
    });

    return () => {
      noteSocket.disConnection();
    };
  }, []);
  useEffect(() => {
    if (currentEditingNote?.status) {
      setShowModal(false);
    }
  }, [currentEditingNote?.status]);

  const whenGetSocketUpdateShouldDo = (
    updatedNoteViaSocket: INote,
    noteStatusChagned: boolean
  ) => {
    setCurrentEditingNote(updatedNoteViaSocket);
    setUpdateChild(true);
    if (noteStatusChagned) {
      setShowModal(false);
    }
  };
  useEffect(() => {
    const notes_ = allNotes.filter((note: INote) => note.status === "active");
    const archives = allNotes.filter(
      (note: INote) => note.status === "archived"
    );
    const trashes = allNotes.filter((note: INote) => note.status === "deleted");
    setNotes(notes_);
    setArchives(archives);
    setTrashes(trashes);

    noteSocket.setNotes(notes_);
    noteSocket.setAllNotes(allNotes);
    NoteDataManager.setCurrentNotes(notes_); // give only active notes, not all notes
  }, [allNotes]);
  useEffect(() => {
    if (!updatedNote) return;

    asyncUpdateNote(updatedNote.shareId);
  }, [updatedNote]);

  const asyncGetNote = async () => {
    const result: { data: Array<INote> } | any = await getNotes({});

    if (result && result.data && result.data.length > 0) {
      setAllNotes(result.data.map(({ data }: any) => JSON.parse(data)));
    }
  };

  const asyncCreateNote = async (newNote: INote) => {
    setAllNotes([...allNotes, newNote]);

    const result: IResponse | any = await createNote({
      json: JSON.stringify(newNote),
    });

    if (result && result.data && result.data.success) {
      // setAllNotes([...allNotes, newNote]);
    }
  };
  const asyncDeleteNote = async (shareId: string) => {
    setAllNotes(allNotes.filter((note: INote) => note.shareId !== shareId));

    const result: IResponse | any = await deleteNote({ shareId });

    if (result && result.data && result.data.success) {
      // setMockUpNoteData(
      //     mockUpNoteData.filter((note: INote) => note.shareId !== shareId)
      // );
    }
  };
  const asyncDeleteAll = async () => {
    const result: IResponse | any = await deleteAll({});

    if (result && result.data && result.data.success) {
      setAllNotes([]);
    }
  };
  const updateNoteState = (noteIn: INote) => {
    setAllNotes(
      allNotes.map((note: INote) =>
        note.shareId === noteIn.shareId ? noteIn : note
      )
    );
    setUpdatedNote(noteIn);
  };
  const asyncUpdateNote = async (shareId: any) => {
    const existingNote = allNotes.find(
      (note: INote) => note.shareId === shareId
    );

    if (!existingNote) return;

    const result: IResponse | any = await updateNote({
      shareId,
      json: JSON.stringify(existingNote),
    });

    if (result && result.data && result.data.success) {
      // setMockUpNoteData(
      //     mockUpNoteData.map((note: INote) =>
      //         note.shareId === shareId ? updatedNote : note
      //     )
      // );
    }
  };

  const add = async (newNote: INote) => {
    asyncCreateNote(newNote);
  };
  const remindNote = (
    shareId: string,
    allNotes: Array<INote>,
    setAllNotes: Function
  ) => {
    const note: INote | undefined = allNotes.find(
      (note_: INote) => note_.shareId === shareId
    );
    if (!note) return;

    NoteDataManager.init(note);
    setAllNotes(
      allNotes.map((note_: INote) =>
        note_.shareId === note.shareId ? NoteDataManager.remindNote() : note_
      )
    );
  };
  const checkDoneRemindNote = (
    shareId: string,
    allNotes: Array<INote>,
    setAllNotes: Function
  ) => {
    const note: INote | undefined = allNotes.find(
      (note_: INote) => note_.shareId === shareId
    );
    if (!note) return;
    NoteDataManager.init(note);
    setAllNotes(
      allNotes.map((note_: INote) =>
        note_.shareId === note.shareId
          ? NoteDataManager.checkDoneRemindNote()
          : note_
      )
    );
  };
  const handleCloseModal = (updatedNote: INote) => {
    setWillCloseModal(true);
  };
  const closeModal = (updatedNote: INote) => {
    setShowModal(false);
    setWillCloseModal(false);
    currentEditingNote && updateNoteState(updatedNote);
  };
  const updateCurrentEditingNote = (noteIn: INote) => {
    setCurrentEditingNote(noteIn);
    updateNoteState(noteIn);
  };

  return (
    <div className="text-black pt-5 pb-5">
      <Head>
        <title>Sticky Notes</title>
        <style>
          {`
                        body {
                        background-color: white !important;
                        }
                        .animate__animated.p-6 {
                            padding: 0;
                        }
                    `}
        </style>
      </Head>
      <div className="create-note-group flex flex-col sm:flex-row gap-2 sm:gap-5 w-min mx-auto">
        <InputField add={add} noteType="text" />
        <InputField add={add} noteType="checklist" />
      </div>
      <br />
      {/* <button onClick={asyncDeleteAll}>Delete All</button> */}
      {showModal && (
        <NoteDataContext.Provider
          value={{
            notes: notes as any,
            setNotes: setNotes as any,
            deleteNote: asyncDeleteNote,
            updateNote: updateCurrentEditingNote,
            updateNoteToServer: asyncUpdateNote,
            shouldGetUpdateFromParent: updateChild,
            setShouldGetUpFrmParnt: setUpdateChild,
            setShowModal,
            setCurrentEditingNote,
          }}
        >
          <Rodal
            visible={showModal}
            onClose={handleCloseModal as any}
            className="bg-transparent p-0"
          >
            <Note
              mode="edit"
              note={
                currentEditingNote
                  ? currentEditingNote
                  : NoteDataManager.generateTemplateNote()
              }
              shouldProvideUpdate={willCloseModal}
              callbackAfterProvide={closeModal as any}
              addNoteToField={handleCloseModal}
              userRole="owner"
            />
          </Rodal>
        </NoteDataContext.Provider>
      )}
      <br />
      <div className="field flex flex-col sm:flex-row gap-2 sm:gap-5 w-full">
        <nav className="w-full sm:w-auto">
          {gTabs.map(({ name, icon }: any) => (
            <p
              key={`tab-index-${name}`}
              onClick={() => setTab(name)}
              className={`
                                flex items-center gap-4 px-10 py-2 pl-5 rounded-r-full text-base 
                                ${name === tab ? "bg-violet-300" : ""} hover:bg-violet-800 hover:text-white hover:cursor-pointer
                            `}
            >
              {icon}
              {name}
            </p>
          ))}
        </nav>
        <div className="main-area grow">
          <NoteDataContext.Provider
            value={{
              notes: notes as any,
              setNotes: setNotes as any,
              deleteNote: asyncDeleteNote,
              updateNote: updateNoteState,
              updateNoteToServer: asyncUpdateNote,
              shouldGetUpdateFromParent: updateChild,
              setShouldGetUpFrmParnt: setUpdateChild,
              setShowModal,
              setCurrentEditingNote,
              deleteNotePermanently: asyncDeleteNote,
            }}
          >
            <div
              className={`notes-wrap w-72 m-auto sm:w-full ${tab !== gTabs[0].name ? "hidden" : ""}`}
            >
              <Notes_ shouldUpdateGridVisual={tab === gTabs[0].name} />
            </div>
            {/* <Notes
                            userRole="owner"
                            visible={tab === gTabs[0].name}
                        /> */}
          </NoteDataContext.Provider>
          <NoteDataContext.Provider
            value={{
              archives: archives,
              setArchives: setArchives,
              updateNote: updateNoteState,
              updateNoteToServer: asyncUpdateNote,
              shouldGetUpdateFromParent: updateChild,
              setShouldGetUpFrmParnt: setUpdateChild,
            }}
          >
            <Archives userRole="owner" visible={tab === gTabs[1].name} />
          </NoteDataContext.Provider>
          <NoteDataContext.Provider
            value={{
              trashes: trashes,
              setTrashes: setTrashes,
              updateNote: updateNoteState,
              updateNoteToServer: asyncUpdateNote,
              shouldGetUpdateFromParent: updateChild,
              setShouldGetUpFrmParnt: setUpdateChild,
              deleteNotePermanently: asyncDeleteNote,
            }}
          >
            <Trashes userRole="owner" visible={tab === gTabs[2].name} />
          </NoteDataContext.Provider>
        </div>
      </div>
    </div>
  );
};

export default withAuth(Index, USER_ROLES, "ai-platform");
