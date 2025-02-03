import React from "react";
import Dropdown from "../Dropdown";
import {
  CopySVG,
  DotsSVG,
  DownloadSVG,
  PencilSquareSVG,
  ShareSVG,
  TrashSVG,
} from "../icons/SVGData";

type FilesDropdownProps = {
  isLightMode: boolean;
  handleDownloadItem: () => void;
  setIsNewNameModalOpen: (isName: boolean) => void;
  onRequestCopy: (() => void) | undefined;
  handleShareClick: () => void;
  onRequestDelete: () => void;
  type: string;
};
const FilesDropdown = ({
  isLightMode,
  handleDownloadItem,
  setIsNewNameModalOpen,
  onRequestCopy,
  handleShareClick,
  onRequestDelete,
  type,
}: FilesDropdownProps) => {
  return (
    <Dropdown
      offset={[0, 5]}
      placement={"bottom-end"}
      button={
        <DotsSVG className={`h-5 w-5 ${isLightMode && "text-gray-500"}`} />
      }
    >
      <ul
        className="w-36"
        style={isLightMode ? { backgroundColor: "white", color: "black" } : {}}
      >
        {type === "file" && (
          <li>
            <button
              type="button"
              onClick={() => handleDownloadItem()}
              className="flex items-center"
            >
              <div className="scale-75 mr-1">
                <DownloadSVG />
              </div>
              Download
            </button>
          </li>
        )}
        <li>
          <button
            type="button"
            onClick={e => {
              setIsNewNameModalOpen(true);
            }}
            className="flex items-center"
          >
            <div className="scale-75 mr-1">
              <PencilSquareSVG />
            </div>
            Rename
          </button>
        </li>
        {type === "file" && onRequestCopy && (
          <li>
            <button
              type="button"
              onClick={() => onRequestCopy()}
              className="flex items-center"
            >
              <div className="scale-75 mr-1">
                <CopySVG />
              </div>
              Make a copy
            </button>
          </li>
        )}
        {type === "file" && (
          <li>
            <button
              type="button"
              onClick={() => handleShareClick()}
              className="flex items-center"
            >
              <div className="scale-75 mr-1">
                <ShareSVG />
              </div>
              Share
            </button>
          </li>
        )}
        <li>
          <button
            type="button"
            onClick={() => onRequestDelete()}
            className="flex items-center"
          >
            <div className="scale-75 mr-1">
              <TrashSVG />
            </div>
            Delete
          </button>
        </li>
      </ul>
    </Dropdown>
  );
};

export default FilesDropdown;
