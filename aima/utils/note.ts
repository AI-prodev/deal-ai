import { jwtDecode } from "jwt-decode";
import { IPubSession } from "@/interfaces/IPubSession";
import { io } from "socket.io-client";
import { INote } from "@/interfaces/INote";
import { createContext } from "react";

const pubSessionName = "public_user_session";
export const noteDefaultBgColor = "#FCEC60";

export const NoteDataContext = createContext({} as any);
export const NoteLevelContext = createContext({} as any);

export const capitalizeString = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const shareLinkGen = (shareId: string, shareMode: string) => {
  return `${window.location.origin}/apps/note-collab/${shareMode}/${shareId}`;
};

export const getSession = (): IPubSession | null => {
  const json = localStorage.getItem(pubSessionName);
  if (!json) return null;

  const session: IPubSession = JSON.parse(json);

  return session;
};

export const setSession = (jwt: string) => {
  if (!jwt) throw Error(`Invalid JWT: ${jwt}`);

  const decoded = jwtDecode(jwt);
  const { shareId }: any = decoded;

  if (!shareId) throw Error("Empty shareId");

  let session: IPubSession = {};
  const newSession: IPubSession = { [shareId]: jwt };

  const updateSession = () => {
    const existingSession: IPubSession | null = getSession();

    if (existingSession) {
      session = { ...existingSession, ...newSession };
    } else {
      session = newSession;
    }
  };

  updateSession();

  const saveToLocalStorage = () => {
    localStorage.setItem(pubSessionName, JSON.stringify(session));
  };

  saveToLocalStorage();
};

export const randomLinkID = () => Math.random().toString(36).substring(2, 15);
export const generateRandomPassword = () => {
  return Math.random().toString(36).substring(2, 8);
};

export const noteSocket = {
  socket: null as any,
  accessRole: "owner",
  notes: [] as INote[],
  allNotes: [] as INote[],
  note: {} as INote,
  initConnection: function () {
    this.socket = io(process.env.NEXT_PUBLIC_BASEURL as string, {
      path: "/socket-io",
      transports: ["websocket"],
    });
    this.socket.on("connect_error", (error: any) => {
      // Handle the connection failure here
    });
  },
  initConnectionAsCollaborator: function (updateNoteCallback: Function) {
    if (this.socket) {
      console.error("Socket already connected, skip initializing.");
      return;
    }

    this.initConnection();

    this.accessRole = "collaborator";

    this.socket.on("note_data_updated_by_owner", (data: any) => {
      if (!data.json) return;

      updateNoteCallback(data.json, this.note);
    });
  },
  initConnectionAsOwner: function (updateNoteCallback: Function) {
    if (this.socket) {
      console.error("Socket already connected, skip initializing.");
      return;
    }

    this.initConnection();

    this.accessRole = "owner";

    this.socket.on("note_data_updated_by_collaborator", (data: any) => {
      if (!data.json) return;

      updateNoteCallback(data.json, this.notes, this.allNotes);
    });
  },
  disConnection: function () {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  },
  setNotes: function (notes: INote[]) {
    this.notes = notes;
  },
  setAllNotes: function (notes: INote[]) {
    this.allNotes = notes;
  },
  setNote: function (note: INote) {
    this.note = note;
  },
};

export const NoteDataManager = {
  note: {} as INote,
  notesForAlarm: [] as Array<INote>,
  webNotifier: null as any,
  setNotes: function (notes: Array<INote>) {
    this.notesForAlarm = notes;
  },
  init: function (note: INote) {
    this.note = { ...note };
  },
  generateTemplateNote: function () {
    return {
      title: "title",
      contentType: "description",
      description: "description",
      checkList: {
        todoItems: [],
        doneItems: [],
      },
      bgColor: noteDefaultBgColor,
      shareId: randomLinkID(),
      shareMode: "public",
      status: "active",
      password: generateRandomPassword(),
    };
  },
  descriptionToListItems: function (description: string) {
    if (description.endsWith("\n")) {
      description = description.slice(0, -1); // Remove the last character if it is a line break
    }
    return description.split("\n").filter(item => item.trim() !== "");
  },
  listItemsToDescription: function (listItems: Array<string>) {
    return listItems.join("\n");
  },
  setTitle: function (title: string) {
    return {
      ...this.note,
      title,
    };
  },
  setDescription: function (description: string) {
    return {
      ...this.note,
      description: description,
    };
  },
  toggleCheckbox: function () {
    if (this.note.contentType === "checklist") {
      let description = "";

      if (
        this.note.checkList.doneItems.length === 1 &&
        !this.note.checkList.doneItems[0] &&
        this.note.checkList.doneItems.length === 1 &&
        !this.note.checkList.todoItems[0]
      )
        description = "";
      else
        description = this.note.description
          ? this.note.description
          : this.listItemsToDescription([
              ...this.note.checkList.todoItems,
              ...this.note.checkList.doneItems,
            ]);
      return {
        ...this.note,
        contentType: "description",
        description: description,
        checkList: {
          todoItems: [],
          doneItems: [],
        },
      };
    } else {
      let todoItems: string[] = [];

      if (!this.note.description) todoItems = [];
      else
        todoItems = this.descriptionToListItems(
          this.note.description as string
        );
      return {
        ...this.note,
        contentType: "checklist",
        description: "",
        checkList: {
          todoItems: todoItems,
          doneItems: [],
        },
      };
    }
  },
  checkTodoItem: function (index: number) {
    if (index >= 0 && index < this.note.checkList.todoItems.length) {
      const todoItems = [...this.note.checkList.todoItems];
      const doneItems = [...this.note.checkList.doneItems];
      const todoItemToMove = todoItems.splice(index, 1)[0]; // Remove the todo item from todoItems array
      doneItems.unshift(todoItemToMove); // Add the todo item to the beginning of doneItems array
      return {
        ...this.note,
        checkList: {
          todoItems,
          doneItems,
        },
      };
    }
    return {
      ...this.note,
    };
  },
  unCheckDoneItem: function (index: number) {
    if (index >= 0 && index < this.note.checkList.doneItems.length) {
      const todoItems = [...this.note.checkList.todoItems];
      const doneItems = [...this.note.checkList.doneItems];
      const doneItemToMove = doneItems.splice(index, 1)[0]; // Remove the done item from doneItems array
      todoItems.push(doneItemToMove); // Add the done item to the end of todoItems array
      return {
        ...this.note,
        checkList: {
          todoItems,
          doneItems,
        },
      };
    }
    return {
      ...this.note,
    };
  },
  setCheckListItemDesc: function (
    isTodoItem: Boolean,
    index: number,
    description: string
  ) {
    const todoItems = [...this.note.checkList.todoItems];
    const doneItems = [...this.note.checkList.doneItems];
    if (isTodoItem) {
      todoItems[index] = description;
    } else {
      doneItems[index] = description;
    }
    return {
      ...this.note,
      checkList: {
        todoItems,
        doneItems,
      },
    };
  },
  addTodoItem: function (description: string) {
    const todoItems = [...this.note.checkList.todoItems, description];
    const doneItems = [...this.note.checkList.doneItems];

    return {
      ...this.note,
      checkList: {
        todoItems,
        doneItems,
      },
    };
  },
  addChecklistItemMiddle: function (isTodoItem: Boolean, index: number) {
    const todoItems = [...this.note.checkList.todoItems];
    const doneItems = [...this.note.checkList.doneItems];

    if (isTodoItem) {
      todoItems.splice(index + 1, 0, "");
    } else {
      doneItems.splice(index + 1, 0, "");
    }

    return {
      ...this.note,
      checkList: {
        todoItems,
        doneItems,
      },
    };
  },
  deleteCheckListItem: function (isTodoItem: Boolean, index: number) {
    const todoItems = [...this.note.checkList.todoItems];
    const doneItems = [...this.note.checkList.doneItems];

    if (isTodoItem) {
      if (index >= 0 && index < todoItems.length) {
        todoItems.splice(index, 1);
      }
    } else {
      if (index >= 0 && index < doneItems.length) {
        doneItems.splice(index, 1);
      }
    }

    return {
      ...this.note,
      checkList: {
        todoItems,
        doneItems,
      },
    };
  },
  isEmptyNote: function () {
    const { title, description, checkList } = this.note;

    return (
      !title &&
      !description &&
      checkList.doneItems.length === 0 &&
      checkList.todoItems.length === 0
    );
  },
  setNoteBgColor: function (color: string) {
    return {
      ...this.note,
      bgColor: color,
    };
  },
  archiveNote: function () {
    return {
      ...this.note,
      status: "archived",
    };
  },
  unarchiveNote: function () {
    return {
      ...this.note,
      status: "active",
    };
  },
  deleteNote: function () {
    return {
      ...this.note,
      status: "deleted",
    };
  },
  undeleteNote: function () {
    return {
      ...this.note,
      status: "active",
    };
  },
  setRemindDatetime: function (datetime: Date) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDay = now.getDate();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const remindYear = datetime.getFullYear();
    const remindMonth = datetime.getMonth();
    const remindDay = datetime.getDate();
    const remindHour = datetime.getHours();
    const remindMinute = datetime.getMinutes();

    const status =
      remindYear < currentYear ||
      (remindYear === currentYear && remindMonth < currentMonth) ||
      (remindYear === currentYear &&
        remindMonth === currentMonth &&
        remindDay < currentDay) ||
      (remindYear === currentYear &&
        remindMonth === currentMonth &&
        remindDay === currentDay &&
        remindHour < currentHour) ||
      (remindYear === currentYear &&
        remindMonth === currentMonth &&
        remindDay === currentDay &&
        remindHour === currentHour &&
        remindMinute < currentMinute)
        ? "passed"
        : "planned";

    return {
      ...this.note,
      remind: {
        year: datetime.getFullYear(),
        month: datetime.getMonth(),
        day: datetime.getDate(),
        hour: datetime.getHours(),
        minute: datetime.getMinutes(),
        status: status,
      },
    };
  },
  removeRemind: function () {
    return {
      ...this.note,
      remind: undefined,
    };
  },
  remindNote: function () {
    return {
      ...this.note,
      remind: {
        ...this.note.remind,
        status: "reminding",
      },
    };
  },
  checkDoneRemindNote: function () {
    return {
      ...this.note,
      remind: {
        ...this.note.remind,
        status: "passed",
      },
    };
  },
  getCurrentNotes: function () {
    return this.notesForAlarm;
  },
  setCurrentNotes: function (notes: Array<INote>) {
    this.notesForAlarm = notes;
  },
  setWebNotifier: function (module: any) {
    this.webNotifier = module;
    // Check if the browser supports notifications
    if (!("Notification" in window)) {
      // This browser does not support desktop notification
    } else {
      // Request permission to show notifications
      Notification.requestPermission().then(function (permission) {
        if (permission === "granted") {
          // If the user accepts, show the notification
          // var notification = new Notification("Hi there!");
        }
      });
    }
  },
  startMonitorRemind: function (
    remindNoteCallback: (
      shareId: string,
      allNotes: Array<INote>,
      setAllNotes: Function
    ) => {},
    checkDoneRemindNote: (
      shareId: string,
      allNotes: Array<INote>,
      setAllNotes: Function
    ) => {},
    setAllNotes: Function
  ) {
    const checkInterval = setInterval(() => {
      const currentDate = new Date();
      const notes = this.getCurrentNotes();

      // loop all notes to compare alarm date and time
      notes.map((note: INote) => {
        if (
          note.remind &&
          note.remind.status === "planned" &&
          currentDate.getMonth() === note.remind.month &&
          currentDate.getDate() === note.remind.day &&
          currentDate.getFullYear() === note.remind.year &&
          currentDate.getHours() === note.remind.hour &&
          currentDate.getMinutes() === note.remind.minute
        ) {
          this.showNotification(
            `Please remind this note: ${note.title}`,
            note.shareId,
            checkDoneRemindNote,
            setAllNotes
          );
          remindNoteCallback(note.shareId, this.notesForAlarm, setAllNotes);
        }
      });
    }, 10000); // 10 seconds interval

    // Clear the interval after 24 hours
    setTimeout(
      () => {
        clearInterval(checkInterval);
      },
      24 * 60 * 60 * 1000
    ); // 24 hours
  },
  showNotification: function (
    message: string,
    shareId: string,
    checkDoneRemindNote: Function,
    setAllNotes: Function
  ) {
    const self = this;
    // Code to show a notification on the frontend
    this.webNotifier?.showNotification(
      message,
      {
        body: 'Please check your sticky note red bounded in the "Notes" tab of this page.',
        icon: "my-icon.ico",
        onClick: function onNotificationClicked() {
          window.location =
            `${process.env.NEXT_PUBLIC_FRONT_BASE_URL}/apps/note-owner` as any;
          checkDoneRemindNote(shareId, self.notesForAlarm, setAllNotes);
        },
        autoClose: 4000,
      },
      function onShow(error: any, hide: any) {
        if (error) {
          window.alert("Unable to show notification: " + error.message);
        } else {
          setTimeout(function hideNotification() {
            hide();
            checkDoneRemindNote(shareId, self.notesForAlarm, setAllNotes);
          }, 1000 * 60);
        }
      }
    );
  },
  differentStatus: function (note1: INote, note2: INote) {
    if (!note1 || !note2) return false;

    if (note1.status !== note2.status) return true;

    return false;
  },
  setNotePassword: function (password: string) {
    return {
      ...this.note,
      password: password,
    };
  },
  setNoteShareMode: function (shareMode: string) {
    return {
      ...this.note,
      shareMode: shareMode,
    };
  },
};
