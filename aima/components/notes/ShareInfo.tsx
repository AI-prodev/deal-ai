import { capitalizeString } from "@/utils/note";
import { PasswordInput } from "@leafygreen-ui/password-input";
import { useState, useEffect } from "react";

const iconSize = 4.5;
interface Props {
  shareMode: string;
  shareLink: string;
  password: string;
  setNotePassword: Function;
  setShareMode: Function;
}

const ShareInfo = (props: Props) => {
  const [password, setPassword] = useState(props.password);
  const [copied, setCopied] = useState(false);
  const [showChangePasswordButton, setShowChangePasswordButton] =
    useState(false);

  useEffect(() => {
    if (copied) {
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  }, [copied]);

  const toggleShareMode = () => {
    props.setShareMode(props.shareMode === "private" ? "public" : "private");
  };
  const hCopy = () => {
    // const clipboardString =
    //     props.shareMode === "private"
    //         ? `link: ${props.shareLink}\npassword: ${props.password}`
    //         : `link: ${props.shareLink}`;
    const clipboardString = props.shareLink;

    try {
      navigator.clipboard.writeText(clipboardString);
      setCopied(true);
    } catch (err) {
      try {
        // if above clipboard copy failed try another method so that it works on various devices like ios, linux
        const textArea = document.createElement("textarea");
        textArea.value = clipboardString;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setCopied(true);
      } catch (error) {
        console.error(error);
      }
    }
  };
  const handlePasswordChange = (e: any) => {
    if (!showChangePasswordButton) {
      setShowChangePasswordButton(true);
    }
    setPassword(e.target.value);
  };

  return (
    <div className="share-info-modal w-80 flex flex-col gap-3 p-3 rounded shadow bg-white bg-opacity-75">
      <div className="share-mode-part flex items-center gap-2">
        <button className="toggle-mode">
          {props.shareMode === "private" && (
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
                d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
          )}
          {props.shareMode === "public" && (
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
                d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
          )}
        </button>
        <p>Share Notes</p>
      </div>
      <div className="share-info relative flex flex-col gap-3 p-2 pb-7 bg-gray-200 bg-opacity-50 rounded border">
        <div className="project-part flex gap-2 items-center">
          <p className="font-semibold">Password Protected: </p>
          <div className="switch-button relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
            <input
              type="checkbox"
              name="toggle"
              id="toggle"
              checked={props.shareMode === "private"}
              onClick={toggleShareMode}
              className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
            />
            <label
              htmlFor="toggle"
              className="toggle-label block overflow-hidden h-6 mb-0 rounded-full bg-gray-300 cursor-pointer"
            ></label>
          </div>
        </div>
        <button
          onClick={hCopy}
          className="copy absolute bottom-0 left-1 py-0 px-1 rounded-lg border shadow hover:bg-violet-800 hover:text-white"
          style={{ fontSize: "small" }}
        >
          {copied ? "Share Link Copied!" : "Copy Share Link"}
        </button>
        {/* <div className="share-link flex gap-2">
                    <p style={{ minWidth: "max-content" }}>Share Link:</p>
                    <p className="text-blue-500 overflow-hidden whitespace-nowrap text-ellipsis">
                        {props.shareLink}
                    </p>
                </div> */}
        <div
          className="password-part flex gap-2"
          style={{
            opacity: props.shareMode !== "private" ? "0.5" : "1",
          }}
        >
          password:
          <PasswordInput
            label=""
            disabled={props.shareMode === "public"}
            stateNotifications={
              [
                // {
                //     notification: "i'm an error",
                //     state: "error",
                // },
                // {
                //     notification: "i'm a warning",
                //     state: "warning",
                // },
                // {
                //     notification: "i'm valid",
                //     state: "valid",
                // },
                // {
                //     notification: "i'm waiting",
                //     state: "none",
                // },
              ]
            }
            autoComplete="new-password"
            id="new-password"
            value={password}
            onChange={handlePasswordChange}
            className="grow"
          />
          <button
            onClick={() => props.setNotePassword(password)}
            className={`${showChangePasswordButton ? "" : "hidden"} px-2 rounded border shadow hover:bg-violet-800 hover:text-white`}
          >
            Change
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareInfo;
