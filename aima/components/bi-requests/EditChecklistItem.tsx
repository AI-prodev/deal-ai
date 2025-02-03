import { Dispatch, SetStateAction, useState } from "react";
import AnimateHeight from "react-animate-height";
import { FilesList } from "./files-list/files-list";
import { ResponseItem } from "@/interfaces/IBusinessInformationRequest";
import { useSession } from "next-auth/react";

export const EditChecklistItem = ({
  item,
  index,
  togglePara1,
  active1,
  responses,
  setResponses,
  handleSave,
}: {
  item: ResponseItem;
  index: number;
  togglePara1: (value: number) => void;
  active1: number;
  responses: ResponseItem[];
  setResponses: Dispatch<SetStateAction<ResponseItem[]>>;
  handleSave: (resps?: ResponseItem[]) => Promise<void>;
}) => {
  const { data: session } = useSession();
  const [editingText, setEditingText] = useState<string>();

  const handleFileUpload = async (
    files: {
      fileName: string;
      fileUrl: string;
    }[]
  ) => {
    const copy = [...responses];
    copy.splice(index, 1, {
      ...copy[index],
      files,
    });
    setResponses(copy);
    if (handleSave) handleSave(copy);
  };

  const handleFileRemoval = (
    files: {
      fileName: string;
      fileUrl: string;
    }[],
    listIndex: number
  ) => {
    const update = {
      ...responses[listIndex],
      files,
    };
    const copy = [...responses];
    copy[listIndex] = update;
    setResponses(copy);
    if (handleSave) handleSave(copy);
  };

  return (
    <div className="border font-semibold dark:border-transparent">
      <div className="dark:border-transparent">
        <button
          type="button"
          className={` ${
            active1 === index ? "!text-primary" : ""
          } flex w-full items-start p-4 text-start text-lg text-white-light dark:bg-[#1b2e4b]`}
          onClick={() => {
            togglePara1(index);
            setEditingText(responses[index].response);
          }}
        >
          <div className="flex items-center ">
            {item.isTitle !== true &&
              (item.replies.length > 0 || item.files.length > 0) && (
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 rounded-full px-2"
                  checked
                />
              )}
            <span className="px-2">{item.text}</span>
          </div>
          <div
            className={`${
              active1 === index ? "rotate-180" : ""
            } ltr:ml-auto rtl:mr-auto`}
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 9L12 15L5 9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </button>
        <div>
          <AnimateHeight duration={300} height={active1 === index ? "auto" : 0}>
            <div className="space-y-6 pt-2 pb-12 text-[16px] text-white-dark">
              <div className="flex flex-col items-end">
                <textarea
                  rows={6}
                  className="form-textarea w-full ltr:rounded-l-none rtl:rounded-r-none"
                  value={editingText}
                  placeholder="Respond to this item here..."
                  onChange={e => {
                    setEditingText(e.target.value);
                  }}
                ></textarea>
                <button
                  type="button"
                  className="btn btn-outline-success mt-2"
                  disabled={!editingText}
                  onClick={() => {
                    const update: {
                      actor: string;
                      text: string;
                    }[] = [...responses[index].replies];
                    update.push({
                      actor: `${session?.user.name} (seller)`,
                      text: editingText ?? "",
                    });
                    const copy = [...responses];
                    copy.splice(index, 1, {
                      ...responses[index],
                      replies: update,
                    });
                    setResponses(copy);
                    setEditingText("");
                    handleSave(copy);
                  }}
                >
                  Add
                </button>
              </div>
              {item?.replies?.length > 0 && (
                <div className="my-6 flex flex-col space-y-4">
                  <span>Discussion:</span>
                  {item.replies.map((reply, index) => (
                    <div
                      key={reply.actor + index}
                      className="flex flex-row justify-between"
                    >
                      <div>
                        <span
                          className={
                            reply.actor.includes("seller")
                              ? "text-lime-500"
                              : "text-red-600"
                          }
                        >
                          {reply.actor}:
                        </span>
                        <span className="ml-4">{reply.text}</span>
                      </div>
                      {/* <div>
                        <span className="text-sm italic text-gray-500">
                          {new Date(
                            reply.updatedAt || new Date()
                          ).toLocaleDateString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div> */}
                    </div>
                  ))}
                </div>
              )}
              <FilesList
                fileUploadHandler={handleFileUpload}
                filesList={item.files}
                listIndex={index}
                callback={handleFileRemoval}
              />
            </div>
          </AnimateHeight>
        </div>
      </div>
    </div>
  );
};
