import AnimateHeight from "react-animate-height";
import { FilesList } from "./files-list/files-list";
import { Dispatch, SetStateAction } from "react";
import { ResponseItem } from "@/interfaces/IBusinessInformationRequest";
import { useSession } from "next-auth/react";

export const ReadOnlyChecklistItem = ({
  item,
  index,
  togglePara1,
  active1,
  responses,
  setResponses,
  editingItem,
  setEditingItem,
  editingText,
  setEditingText,
  isDetail,
  handleSave,
}: {
  item: ResponseItem;
  index: number;
  togglePara1: (value: number) => void;
  active1: number;
  responses: ResponseItem[];
  setResponses: Dispatch<SetStateAction<ResponseItem[]>>;
  editingItem: number | undefined;
  setEditingItem: Dispatch<SetStateAction<number | undefined>>;
  editingText: string | undefined;
  setEditingText: Dispatch<SetStateAction<string | undefined>>;
  isDetail?: boolean;
  handleSave?: (resps?: ResponseItem[]) => Promise<void>;
}) => {
  const { data: session } = useSession();

  const handleFileUpload = async (
    files: {
      fileName: string;
      fileUrl: string;
    }[]
  ) => {
    const update = {
      ...responses[index],
    };
    update.files = files;
    const copy = [...responses];
    copy[index] = update;
    setResponses(copy);
    if (handleSave) handleSave(copy);
  };

  const handleFileRemoval = (
    files: {
      fileName: string;
      fileUrl: string;
    }[]
  ) => {
    const update = {
      ...responses[index],
      files,
    };
    const oldRespIndex = responses.findIndex(resp => resp.text === item.text);
    const copy = [...responses];
    copy[oldRespIndex] = update;
    setResponses(copy);
    if (handleSave) handleSave(copy);
  };

  const handleIsItemDisabled = (index: number): boolean => {
    const sectionalTitles = responses.filter(item => item.isTitle);

    if (
      sectionalTitles.find(
        sectionalTitle => sectionalTitle.section === responses[index].section
      )?.isSentToSeller
    )
      return false;
    return true;
  };

  return (
    <div
      key={`${index}-${item.text}`}
      id={`${index}-${item.text}`}
      className="border font-semibold dark:border-transparent"
    >
      <div className="dark:border-transparent">
        {editingItem !== index ? (
          <>
            <div className="group flex flex-row">
              <button
                type="button"
                className={` ${
                  active1 === index ? "!text-primary" : ""
                } flex w-full items-start p-4 text-start text-lg text-white-light dark:bg-[#1b2e4b]`}
                onClick={() => togglePara1(index)}
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
              <div
                className={`hidden ${
                  item?.replies?.length === 0 &&
                  !isDetail &&
                  "group-hover:block"
                }`}
              >
                <button
                  type="button"
                  className="btn my-8 ml-4"
                  onClick={() => {
                    setEditingItem(index);
                  }}
                >
                  Edit
                </button>
              </div>
            </div>
            <div>
              <AnimateHeight
                duration={300}
                height={active1 === index ? "auto" : 0}
              >
                <div className="space-y-6 pt-4 pb-12 text-[16px] text-white-dark">
                  <div className="flex w-full flex-col">
                    {!isDetail && handleSave && item.replies.length > 0 && (
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
                              actor: `${session?.user.name} (buyer)`,
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
                    )}
                    {item?.replies?.length > 0 ? (
                      <div className="my-6 flex flex-col space-y-4">
                        <span>Discussion:</span>
                        {item.replies.map((reply, index) => (
                          <div key={reply.actor + index}>
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
                        ))}
                      </div>
                    ) : (
                      <div>
                        <span>No discussion has started just yet.</span>
                      </div>
                    )}
                    {!isDetail && item.replies.length === 0 && (
                      <label className="ml-4 inline-flex min-w-[100px] items-center justify-end group-hover:block">
                        <input
                          type="checkbox"
                          checked={!item.isSentToSeller}
                          className="form-checkbox"
                          disabled={handleIsItemDisabled(index)}
                          onChange={() => {
                            const copy = [...responses];
                            copy[index].isSentToSeller =
                              !copy[index].isSentToSeller;
                            setResponses(copy);
                          }}
                        />
                        <span className="text-white-dark">Hide item</span>
                      </label>
                    )}
                  </div>
                  {item.files.length > 0 && (
                    <FilesList
                      fileUploadHandler={handleFileUpload}
                      filesList={item.files}
                      callback={handleFileRemoval}
                      listIndex={index}
                      isEditing={false}
                    />
                  )}
                </div>
              </AnimateHeight>
            </div>
          </>
        ) : (
          <div className="flex flex-row justify-between">
            <div className="mt-2 w-full">
              <textarea
                rows={6}
                className="form-textarea w-full ltr:rounded-l-none rtl:rounded-r-none"
                value={editingText ?? item.text}
                onChange={e => setEditingText(e.target.value)}
              ></textarea>
            </div>
            <div>
              <button
                type="button"
                className="btn btn-outline-danger my-2 ml-4"
                onClick={() => {
                  setResponses(old => {
                    const copy = [...old];
                    copy.splice(index, 1);
                    return copy;
                  });
                  setEditingItem(undefined);
                  setEditingText(undefined);
                }}
              >
                Remove
              </button>
              <button
                type="button"
                className="btn btn-outline-success ml-4"
                disabled={!editingText || editingText === ""}
                onClick={() => {
                  setResponses(old => {
                    const copy = [...old];
                    copy.splice(index, 1, {
                      ...copy[index],
                      text: editingText ?? "",
                    });
                    return copy;
                  });
                  setEditingItem(undefined);
                  setEditingText(undefined);
                }}
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
