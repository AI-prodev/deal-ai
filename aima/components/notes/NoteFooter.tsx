import { useState, useEffect, useContext } from "react";
import { useDetectClickOutside } from "react-detect-click-outside";
import DateTimePicker from "./DateTimePicker";
import ColorPallete from "./ColorPallete";
import ShareInfo from "./ShareInfo";
import { NoteLevelContext } from "@/utils/note";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

interface Props {
  shareLink?: string;
  noteStatus: string;
  delete?: Function;
  undelete?: Function;
  deleteForever?: Function;
  archive?: Function;
  unarchive?: Function;
  toggleCheckbox: Function;
  createNote?: Function;
  shareMode: string;
  setShareMode: Function;
  userRole: string;
  password: string;
}

const iconSize = 4.5;

const NoteFooter = (props: Props) => {
  const {
    addNoteToField,
    setNotePassword,
  }: {
    addNoteToField: Function;
    setNotePassword: Function;
  } = useContext(NoteLevelContext);
  const [showPallete, setShowPallete] = useState(false);
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const [showCopiedBadge, setShowCopiedBadge] = useState(false);
  const [showShareInfoModal, setShowShareInfoModal] = useState(false);
  const shareInfoModalRef = useDetectClickOutside({
    onTriggered: () => hClickOutsideShareInfo(),
  });

  useEffect(() => {
    if (showCopiedBadge) {
      setTimeout(() => {
        setShowCopiedBadge(false);
      }, 2000);
    }
  }, [showCopiedBadge]);

  const hClickCheck = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    props.toggleCheckbox();
  };
  const hClickPallete = (e: any) => {
    e.stopPropagation();
    setShowPallete(true);
  };
  const hClickReminder = (e: any) => {
    e.stopPropagation();
    setShowDateTimePicker(true);
  };
  const hDelete = (e: any) => {
    e.stopPropagation();
    props.delete && props.delete();
  };
  const hUnDelete = (e: any) => {
    e.stopPropagation();
    props.undelete && props.undelete();
  };
  const hDeleteForever = (e: any) => {
    e.stopPropagation();
    props.deleteForever && props.deleteForever();
  };
  const hArchive = (e: any) => {
    e.stopPropagation();
    props.archive && props.archive();
  };
  const hUnArchive = (e: any) => {
    e.stopPropagation();
    props.unarchive && props.unarchive();
  };
  const hAddNoteToField = (e: any) => {
    e.stopPropagation();
    addNoteToField && addNoteToField();
  };
  const hClickCopyLink = (e: any, shareLink: string) => {
    e.stopPropagation();
    try {
      navigator.clipboard.writeText(shareLink);
      setShowCopiedBadge(true);
    } catch (error) {
      console.error(error);
    }
  };
  const hClickShareMode = (e: any, shareMode: string) => {
    e.stopPropagation();
    setShowShareInfoModal(true);
  };
  const hClickOutsideShareInfo = () => {
    setShowShareInfoModal(false);
  };

  return (
    <div className="note-footer w-full px-2 flex justify-between">
      <div className="actions flex gap-x-1">
        {props.noteStatus === "active" && (
          <Tippy
            content="Reminder"
            placement="top"
            arrow
            delay={1000}
            className="bg-violet-800 text-xs text-white p-2 rounded shadow"
          >
            <button onClick={hClickReminder} className="relative">
              <DateTimePicker
                visible={showDateTimePicker}
                setshowDateTimePicker={setShowDateTimePicker}
              />
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
                  d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                />
              </svg>
            </button>
          </Tippy>
        )}
        {props.noteStatus === "active" && (
          <Tippy
            content="Color"
            placement="top"
            arrow
            delay={1000}
            className="bg-violet-800 text-xs text-white p-2 rounded shadow"
          >
            <button onClick={hClickPallete as any} className="relative">
              {showPallete && (
                <div className="absolute bottom-5 z-10">
                  <button
                    onClick={(e: any) => {
                      e.stopPropagation();
                      setShowPallete(false);
                    }}
                    className="absolute top-1 right-1"
                  >
                    &#10005;
                  </button>
                  <ColorPallete
                    visible={showPallete}
                    setShowPallete={setShowPallete}
                  />
                </div>
              )}
              <svg
                height="800px"
                width="800px"
                version="1.1"
                id="Capa_1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 303.899 303.899"
                className={`w-${iconSize} h-${iconSize}`}
              >
                <g>
                  <path
                    style={{ fill: "#222220" }}
                    d="M266.925,28.461C242.983,4.52,207.511-4.767,167.038,2.317c-39.5,6.912-79.235,28.7-111.884,61.349
    c-2.929,2.93-2.929,7.678,0,10.607c2.929,2.928,7.678,2.928,10.606,0c30.488-30.488,67.374-50.795,103.863-57.181
    c35.516-6.219,66.308,1.589,86.695,21.977c42.831,42.831,27.039,128.315-35.205,190.558
    c-30.488,30.488-67.374,50.795-103.863,57.181c-35.52,6.217-66.308-1.589-86.695-21.977c-4.824-4.823-7.191-9.188-7.036-12.973
    c0.295-7.188,9.422-14.929,18.25-22.414c11.187-9.487,22.755-19.297,23.311-32.837c0.326-7.948-3.397-15.868-11.067-23.538
    c-30.167-30.168-25.777-49.291-17.503-64.018c2.029-3.611,0.746-8.184-2.865-10.213s-8.184-0.746-10.212,2.865
    c-15.215,27.083-8.868,53.13,19.974,81.973c4.583,4.583,6.833,8.728,6.686,12.315c-0.286,6.969-9.304,14.616-18.025,22.012
    c-11.293,9.577-22.97,19.479-23.535,33.239c-0.339,8.26,3.396,16.174,11.417,24.195c18.703,18.703,44.438,28.462,74.101,28.461
    c8.309,0,16.931-0.767,25.786-2.316c39.5-6.912,79.235-28.7,111.884-61.349c32.649-32.649,54.437-72.384,61.35-111.884
    C300.153,87.878,290.868,52.405,266.925,28.461z"
                  />
                  <path
                    style={{ fill: "#222220" }}
                    d="M64.762,229.393c-9.554,9.555-9.554,25.101,0,34.655c4.628,4.628,10.782,7.177,17.327,7.177
    s12.699-2.549,17.328-7.177c4.628-4.629,7.177-10.782,7.177-17.327c0-6.546-2.549-12.699-7.177-17.328
    c-4.628-4.628-10.782-7.177-17.328-7.177S69.39,224.765,64.762,229.393z M91.594,246.721c0,2.538-0.989,4.925-2.784,6.72
    c-1.795,1.796-4.182,2.784-6.721,2.784c-2.539,0-4.925-0.988-6.721-2.784c-3.706-3.705-3.706-9.735,0-13.44
    c1.795-1.796,4.182-2.784,6.721-2.784c2.539,0,4.926,0.988,6.721,2.784C90.605,241.795,91.594,244.182,91.594,246.721z"
                  />
                  <path
                    style={{ fill: "#222220" }}
                    d="M146.566,219.728c-2.929-2.929-7.678-2.93-10.607-0.001c-4.628,4.629-7.178,10.782-7.178,17.328
    c0,6.545,2.549,12.698,7.177,17.326c4.628,4.629,10.782,7.179,17.328,7.179s12.699-2.55,17.327-7.178
    c9.554-9.555,9.554-25.101,0-34.655c-2.929-2.928-7.678-2.928-10.606,0c-2.929,2.93-2.929,7.678,0,10.607
    c3.706,3.705,3.706,9.735,0,13.441c-1.795,1.795-4.182,2.784-6.72,2.784s-4.925-0.989-6.721-2.785
    c-1.795-1.795-2.784-4.182-2.784-6.72c0-2.539,0.989-4.926,2.784-6.721C149.495,227.406,149.495,222.657,146.566,219.728z"
                  />
                  <path
                    style={{ fill: "#222220" }}
                    d="M190.919,178.203c-4.628,4.629-7.177,10.782-7.177,17.328c0,6.545,2.549,12.698,7.177,17.327
    c4.628,4.628,10.782,7.177,17.327,7.177s12.699-2.549,17.328-7.177c9.554-9.555,9.554-25.101,0-34.655
    c-4.628-4.628-10.782-7.177-17.328-7.177S195.547,173.575,190.919,178.203z M214.967,202.251c-1.795,1.796-4.182,2.784-6.721,2.784
    c-2.539,0-4.925-0.988-6.721-2.784c-1.795-1.795-2.784-4.182-2.784-6.72c0-2.539,0.989-4.926,2.784-6.721
    c1.795-1.796,4.182-2.784,6.721-2.784c2.539,0,4.926,0.988,6.721,2.784C218.672,192.516,218.672,198.546,214.967,202.251z"
                  />
                  <path
                    style={{ fill: "#222220" }}
                    d="M248.1,155.678c1.464,1.464,3.384,2.196,5.303,2.196s3.839-0.732,5.303-2.196
    c9.554-9.555,9.554-25.101,0-34.655c-9.553-9.553-25.1-9.553-34.655,0c-9.554,9.555-9.554,25.101,0,34.655
    c2.929,2.928,7.678,2.928,10.606,0c2.929-2.93,2.929-7.678,0-10.607c-3.706-3.705-3.706-9.735,0-13.44
    c3.705-3.707,9.736-3.709,13.442,0c3.706,3.705,3.706,9.735,0,13.44C245.171,148,245.171,152.748,248.1,155.678z"
                  />
                  <path
                    style={{ fill: "#222220" }}
                    d="M240.574,46.798c-6.545,0-12.699,2.549-17.327,7.177c-9.554,9.555-9.554,25.101,0,34.655
    c4.628,4.628,10.782,7.177,17.327,7.177s12.699-2.549,17.327-7.177c9.554-9.555,9.554-25.101,0-34.655
    C253.273,49.347,247.12,46.798,240.574,46.798z M247.295,78.023c-1.795,1.796-4.182,2.784-6.721,2.784s-4.925-0.988-6.721-2.784
    c-3.706-3.705-3.706-9.735,0-13.44c1.795-1.796,4.182-2.784,6.721-2.784s4.925,0.988,6.721,2.784
    C251.001,68.287,251.001,74.318,247.295,78.023z"
                  />
                  <path
                    style={{ fill: "#222220" }}
                    d="M175.525,29.844c-6.545,0-12.699,2.549-17.327,7.177c-9.554,9.555-9.554,25.101,0,34.654
    c4.628,4.629,10.782,7.179,17.328,7.179s12.699-2.55,17.327-7.178c4.628-4.629,7.178-10.782,7.178-17.327
    c0-6.546-2.549-12.699-7.178-17.328C188.223,32.393,182.07,29.844,175.525,29.844z M182.245,61.07
    c-1.795,1.795-4.182,2.784-6.72,2.784s-4.925-0.989-6.721-2.785c-3.706-3.705-3.706-9.735,0-13.44
    c1.795-1.796,4.182-2.784,6.721-2.784s4.925,0.988,6.721,2.784c1.795,1.795,2.784,4.182,2.784,6.721
    C185.029,56.887,184.041,59.274,182.245,61.07z"
                  />
                  <path
                    style={{ fill: "#222220" }}
                    d="M96.532,88.981c-10.17,0-19.731,3.961-26.922,11.152c-7.191,7.191-11.152,16.752-11.152,26.922
    s3.96,19.731,11.152,26.923c7.191,7.19,16.752,11.151,26.922,11.151s19.731-3.961,26.922-11.151
    c14.845-14.845,14.845-38.999,0-53.846C116.263,92.942,106.702,88.981,96.532,88.981z M112.848,143.37
    c-4.358,4.358-10.152,6.759-16.316,6.759c-6.163,0-11.958-2.4-16.315-6.759c-4.358-4.357-6.758-10.151-6.758-16.315
    c0-6.163,2.4-11.958,6.758-16.315c4.358-4.358,10.152-6.759,16.315-6.759c6.164,0,11.958,2.4,16.315,6.758
    C121.844,119.736,121.844,134.374,112.848,143.37z"
                  />
                </g>
              </svg>
            </button>
          </Tippy>
        )}
        {props.noteStatus === "active" && (
          <Tippy
            content="Toggle checklist"
            placement="top"
            arrow
            delay={1000}
            className="bg-violet-800 text-xs text-white p-2 rounded shadow"
          >
            <button
              className="toggle-checklist-text"
              onClick={e => hClickCheck(e)}
            >
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
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>
          </Tippy>
        )}
        {/* {props.shareLink && (
                    <Tippy
                        content="Share Link"
                        placement="top"
                        arrow
                        delay={1000}
                        className="bg-violet-800 text-xs text-white p-2 rounded shadow"
                    >
                        <button
                            onClick={e =>
                                hClickCopyLink(e, props.shareLink as string)
                            }
                            className="relative"
                        >
                            {showCopiedBadge && (
                                <p className="absolute w-max bottom-5 p-3 text-white bg-black rounded">
                                    Share link copied!
                                </p>
                            )}
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
                                    d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
                                />
                            </svg>
                        </button>
                    </Tippy>
                )} */}
        {props.userRole === "owner" && props.noteStatus === "active" && (
          <Tippy
            content="Share"
            placement="top"
            arrow
            delay={1000}
            className="bg-violet-800 text-xs text-white p-2 rounded shadow"
          >
            <button
              onClick={e => hClickShareMode(e, props.shareMode)}
              className="relative"
            >
              {showShareInfoModal && (
                <div
                  className="shareinfo-wrap absolute z-100 w-max bottom-5"
                  ref={shareInfoModalRef}
                >
                  <button
                    onClick={(e: any) => {
                      e.stopPropagation();
                      setShowShareInfoModal(false);
                    }}
                    className="absolute top-1 right-1"
                  >
                    &#10005;
                  </button>
                  <ShareInfo
                    shareMode={props.shareMode}
                    setShareMode={props.setShareMode}
                    shareLink={props.shareLink as string}
                    password={props.password}
                    setNotePassword={setNotePassword}
                  />
                </div>
              )}
              {props.shareMode === "private" && (
                // <svg
                //     xmlns="http://www.w3.org/2000/svg"
                //     fill="none"
                //     viewBox="0 0 24 24"
                //     strokeWidth={1.5}
                //     stroke="currentColor"
                //     className={`w-${iconSize} h-${iconSize}`}
                // >
                //     <path
                //         strokeLinecap="round"
                //         strokeLinejoin="round"
                //         d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                //     />
                // </svg>
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
                    d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
                  />
                </svg>
              )}
              {props.shareMode === "public" && (
                // <svg
                //     xmlns="http://www.w3.org/2000/svg"
                //     fill="none"
                //     viewBox="0 0 24 24"
                //     strokeWidth={1.5}
                //     stroke="currentColor"
                //     className={`w-${iconSize} h-${iconSize}`}
                // >
                //     <path
                //         strokeLinecap="round"
                //         strokeLinejoin="round"
                //         d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                //     />
                // </svg>
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
                    d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
                  />
                </svg>
              )}
            </button>
          </Tippy>
        )}
        {props.archive && (
          <Tippy
            content="Archive"
            placement="top"
            arrow
            delay={1000}
            className="bg-violet-800 text-xs text-white p-2 rounded shadow"
          >
            <button onClick={hArchive as any}>
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
            </button>
          </Tippy>
        )}
        {props.unarchive && (
          <Tippy
            content="Unarchive"
            placement="top"
            arrow
            delay={1000}
            className="bg-violet-800 text-xs text-white p-2 rounded shadow"
          >
            <button onClick={hUnArchive as any}>
              <svg
                focusable="false"
                aria-hidden="true"
                viewBox="0 0 24 24"
                className={`w-${iconSize} h-${iconSize}`}
              >
                <path d="m20.54 5.23-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM6.24 5h11.52l.83 1H5.42l.82-1zM5 19V8h14v11H5zm3-5h2.55v3h2.9v-3H16l-4-4z"></path>
              </svg>
            </button>
          </Tippy>
        )}
        {props.delete && (
          <Tippy
            content="Delete"
            placement="top"
            arrow
            delay={1000}
            className="bg-violet-800 text-xs text-white p-2 rounded shadow"
          >
            <button onClick={hDelete as any}>
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
            </button>
          </Tippy>
        )}
        {props.undelete && (
          <Tippy
            content="Restore"
            placement="top"
            arrow
            delay={1000}
            className="bg-violet-800 text-xs text-white p-2 rounded shadow"
          >
            <button onClick={hUnDelete as any}>
              <svg
                focusable="false"
                aria-hidden="true"
                viewBox="0 0 24 24"
                className={`w-${iconSize} h-${iconSize}`}
              >
                <path d="m15.5 4-1-1h-5l-1 1H5v2h14V4zM6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2-5V9h8v10H8v-5zm2 4h4v-4h2l-4-4-4 4h2z"></path>
              </svg>
            </button>
          </Tippy>
        )}
        {props.deleteForever && (
          <Tippy
            content="Delete forever"
            placement="top"
            arrow
            delay={1000}
            className="bg-violet-800 text-xs text-white p-2 rounded shadow"
          >
            <button onClick={hDeleteForever as any}>
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
                  d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m6 4.125 2.25 2.25m0 0 2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
                />
              </svg>
            </button>
          </Tippy>
        )}
      </div>
      {addNoteToField && (
        <Tippy
          content="Submit"
          placement="top"
          arrow
          delay={1000}
          className="bg-violet-800 text-xs text-white p-2 rounded shadow"
        >
          <button onClick={hAddNoteToField as any} className="submit">
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
                d="m4.5 12.75 6 6 9-13.5"
              />
            </svg>
          </button>
        </Tippy>
      )}
    </div>
  );
};

export default NoteFooter;
