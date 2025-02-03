import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { ResponseItem } from "@/interfaces/IBusinessInformationRequest";

export const CustomizableLines = ({
  checklist,
  setChecklist,
}: {
  checklist: ResponseItem[];
  setChecklist: Dispatch<SetStateAction<ResponseItem[]>>;
}) => {
  const [editingItem, setEditingItem] = useState<number>();
  const [editingText, setEditingText] = useState<string>();

  const handleIsItemDisabled = (index: number): boolean => {
    const sectionalTitles = checklist.filter(item => item.isTitle);

    if (
      sectionalTitles.find(
        sectionalTitle => sectionalTitle.section === checklist[index].section
      )?.isSentToSeller
    )
      return false;
    return true;
  };

  return (
    <div className="w-full text-gray-300">
      {checklist.map((item, index) =>
        item.isTitle ? (
          <div
            key={`${item.text}-${index}`}
            className="my-10 flex grow flex-row items-center justify-between"
          >
            <span className="text-xl">{item.text}</span>
            <div className="flex min-w-[255px] flex-row">
              <label className="mt-1 inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={!item.isSentToSeller}
                  onChange={() => {
                    const copy = [...checklist];
                    const titleNewStatus = !item.isSentToSeller;
                    copy.forEach(sectionalItem => {
                      if (sectionalItem.section === item.section) {
                        sectionalItem.isSentToSeller = titleNewStatus;
                      }
                    });
                    setChecklist(copy);
                  }}
                />
                <span className="text-white-dark">Hide section</span>
              </label>
              <button
                className="btn btn-primary ml-4 max-h-[42px] min-w-[133px]"
                onClick={() => {
                  const copy = [...checklist];
                  const lastIndex = copy.findLastIndex(
                    el => el.section === item.section
                  );
                  copy.splice(lastIndex, 0, {
                    isTitle: false,
                    text: "",
                    response: "",
                    section: item.section,
                    isSentToSeller: item.isSentToSeller,
                    files: [],
                    replies: [],
                  });
                  setChecklist(copy);
                  setEditingItem(lastIndex + 1);
                  setEditingText("");
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="mr-2 h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Add item
              </button>
            </div>
          </div>
        ) : (
          <div
            key={`${item.text}-${index}`}
            className="group flex flex-row items-center justify-between hover:rounded hover:border hover:px-2"
          >
            {editingItem !== index ? (
              <p
                className="my-2 text-base"
                onClick={() => setEditingItem(index)}
              >
                {item.text}
              </p>
            ) : (
              <div className="mt-2 w-full">
                <textarea
                  rows={6}
                  className="form-textarea w-full ltr:rounded-l-none rtl:rounded-r-none"
                  value={editingText ?? item.text}
                  onChange={e => setEditingText(e.target.value)}
                ></textarea>
              </div>
            )}

            <div className="flex min-w-[125px] flex-col items-start justify-center">
              <label
                className={`${
                  editingItem !== index && "hidden"
                } ml-4 inline-flex min-w-[100px] cursor-pointer items-center justify-center group-hover:block`}
              >
                <input
                  type="checkbox"
                  checked={!item.isSentToSeller}
                  className="form-checkbox"
                  disabled={handleIsItemDisabled(index)}
                  onChange={() => {
                    const copy = [...checklist];
                    copy[index].isSentToSeller = !copy[index].isSentToSeller;
                    setChecklist(copy);
                  }}
                />
                <span className="text-white-dark">Hide item</span>
              </label>
              {editingItem === index && (
                <>
                  <button
                    type="button"
                    className="btn btn-outline-danger my-2 ml-4"
                    onClick={() => {
                      setChecklist(old => {
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
                      setChecklist(old => {
                        const copy = [...old];
                        copy[index].text = editingText ?? "";
                        return copy;
                      });
                      setEditingItem(undefined);
                      setEditingText(undefined);
                    }}
                  >
                    Save
                  </button>
                </>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
};
