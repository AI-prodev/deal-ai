import { useRouter } from "next/router";
import { createNoteApi } from "@/store/features/noteApi";
import { useEffect, useState } from "react";
import Note from "@/components/notes/Note";
import PubLoginForm from "@/components/notes/PubLoginForm";
import { INote } from "@/interfaces/INote";
import Head from "next/head";
import { noteSocket } from "@/utils/note";
import { NoteDataContext } from "@/utils/note";

const Index = () => {
  const router = useRouter();
  const { slug } = router.query;
  const [shareMode, shareId]: any = slug ? slug : ["", ""];
  const [getNoteCollab] = createNoteApi.useGetNoteCollabMutation();
  const [updateNoteCollab] = createNoteApi.useUpdateNoteCollabMutation();
  const [note, setNote] = useState<INote | null>(null);
  const [noteMode, setNoteMode] = useState("edit");
  const [shareModeChanged, setShareModeChanged] = useState(false);
  const [updatedNote, setUpdatedNote] = useState<INote | null>(null);
  const [gotResponse, setGotResponse] = useState(false);
  const [authRequired, setAuthRequired] = useState(false);
  const [shareIdState, setShareIdState] = useState(slug);
  const [gotSuccessRes, setGotSuccessRes] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [updateChild, setUpdateChild] = useState(false);

  useEffect(() => {
    noteSocket.initConnectionAsCollaborator((json: string, note: INote) => {
      const updatedNote = JSON.parse(json);

      if (updatedNote.shareId !== note?.shareId) return;

      setNote(JSON.parse(json));
      setUpdateChild(true);
    });

    return () => {
      noteSocket.disConnection();
    };
  }, []);
  useEffect(() => {
    if (slug) {
      getData();
    }

    setShareIdState(slug);
  }, [slug]);
  useEffect(() => {
    noteSocket.setNote(note as any);

    if (note?.status === "active") {
      setNoteMode("edit");
    }
    if (note?.status === "archived" || note?.status === "deleted") {
      setNoteMode("view");
    }
  }, [note]);
  useEffect(() => {
    if (!updatedNote) return;

    asyncUpdateNote(updatedNote.shareId);
  }, [updatedNote]);

  const getData = async () => {
    try {
      const result: any = await getNoteCollab({
        shareId: shareId as string,
        shareMode: shareMode as string,
      });
      setGotResponse(true);
      if (result && result.data && result.data.success) {
        setNote(result.data.note);
        setAuthRequired(false);
        setGotSuccessRes(true);
      }
      if (result && result.data && !result.data.success) {
        if (result.data.shareModeChanged) {
          setShareModeChanged(true);
          setErrorMsg(`It seems that the visibility of this note was changed to
                    private from public. Please contact the owner again to get
                    updated link.`);

          // redirect to another url
          router.push(`/apps/note-collab/private/${shareId}`);
        }
        if (result.data.authRequired) {
          setAuthRequired(true);
        }
        setGotSuccessRes(false);
      }
    } catch (error: any) {
      console.error("[Note Collaborator] Failed to get note", error);
    }
  };
  const updateNoteState = (noteIn: INote) => {
    setNote(noteIn);
    setUpdatedNote(noteIn);
  };
  const asyncUpdateNote = async (shareId: any) => {
    interface IResponse {
      data: {
        success: boolean;
        shareModeChanged: boolean;
      };
      error?: {
        data: {
          error: string;
        };
      };
    }
    const result: IResponse | any = await updateNoteCollab({
      shareId,
      shareMode,
      json: JSON.stringify(note),
    });

    if (result && result.data && result.data.success) {
      // setNote(updatedNote);
    }
    if (result && result.data && !result.data.success) {
      if (result.data.shareModeChanged) {
        setShareModeChanged(true);
        setErrorMsg(`It seems that the visibility of this note was changed to
                private from public. Please contact the owner again to get
                updated link.`);

        // redirect to another url
        router.push(`/apps/note-collab/private/${shareId}`);
      }
      if (result.data.authRequired) {
        setAuthRequired(true);
      }
      setGotSuccessRes(false);
    }
    if (result && result.error && result.error.data.error) {
      setGotSuccessRes(false);
      setErrorMsg(result.error.data.error);
    }
  };

  return (
    <div className="text-black">
      <Head>
        <title>Sticky Notes</title>
        <style>
          {`
                        body {
                            background-color: white !important;
                        }
                    `}
        </style>
      </Head>
      <br />
      {!gotResponse && "...loading"}
      {gotResponse && authRequired && (
        <PubLoginForm
          shareId={shareId as string}
          getData={getData}
          setGotResponse={setGotResponse}
          setAuthRequired={setAuthRequired}
        />
      )}
      {gotResponse && !authRequired && gotSuccessRes && note && (
        <>
          <div className="note-status-bar flex gap-2">
            <p className="title text-gray-400 font-normal">Note status: </p>
            <p
              className={`note-status font-bold ${note?.status === "deleted" ? "text-gray-500" : note?.status === "archived" ? "text-blue-300" : "text-green-500"}`}
            >
              {note?.status === "deleted" && "Deleted"}
              {note?.status === "active" && "Active"}
              {note?.status === "archived" && "Archived"}
            </p>
          </div>
          <NoteDataContext.Provider
            value={{
              updateNote: updateNoteState,
              updateNoteToServer: asyncUpdateNote,
              shouldGetUpdateFromParent: updateChild,
              setShouldGetUpFrmParnt: setUpdateChild,
            }}
          >
            <Note mode={noteMode} note={note as any} userRole="collaborator" />
          </NoteDataContext.Provider>
        </>
      )}
      {gotResponse && !authRequired && !gotSuccessRes && (
        <p className="flex gap-3 items-start text-lg text-gray-500 font-bold">
          <p className="text-xl">Error:</p>
          <p>{errorMsg}</p>
        </p>
      )}
    </div>
  );
};

export default Index;
