import { useContext, useEffect, useRef, RefObject, useState } from "react";
import { NoteLevelContext } from "@/utils/note";
import ControlledInputField from "./ControlledInputField";

interface Props {
  index: number;
  isChecked: Boolean;
  description: string;
  noteMode: string;
  noteStatus: string;
  newItemAdded: Boolean;
  isLastItem: Boolean;
  setDeletedItemInfo: Function;
  setCreatedItemInfo: Function;
  willFocus: {
    itemType: string;
    index: number;
  };
  setShouldFocusNewItemField: Function;
}

const CheckListItem = (props: Props) => {
  const {
    checkTodoItem,
    unCheckDoneItem,
    setCheckListDesc,
    deleteCheckListItem,
    createNewCheckListItem,
    bgColor,
  }: {
    checkTodoItem: Function;
    unCheckDoneItem: Function;
    setCheckListDesc: Function;
    deleteCheckListItem: Function;
    createNewCheckListItem: Function;
    bgColor: string;
  } = useContext(NoteLevelContext);
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (props.isChecked === false) {
      checkTodoItem(props.index);
    } else {
      unCheckDoneItem(props.index);
    }
  };
  const editFieldRef: RefObject<HTMLInputElement> = useRef(null);

  useEffect(() => {
    if (props.newItemAdded && props.isLastItem) {
      focusAndGotoEnd();
    }
  }, [props.newItemAdded, props.isLastItem]);
  useEffect(() => {
    const thisItemType = props.isChecked ? "done" : "todo";

    if (
      props.willFocus.itemType === thisItemType &&
      props.willFocus.index === props.index
    ) {
      focusAndGotoEnd();
    }
  }, [props.willFocus]);

  const focusAndGotoEnd = () => {
    editFieldRef.current && (editFieldRef.current as any).focus();
    editFieldRef.current &&
      (editFieldRef.current as any).setSelectionRange(
        editFieldRef.current.value.length,
        editFieldRef.current.value.length
      );
  };
  const handleBackSpaceKeyEvent = () => {
    // check if input field empty
    if (editFieldRef.current && editFieldRef.current.value === "") {
      deleteCheckListItem(!props.isChecked, props.index);
      props.setDeletedItemInfo({
        isDeleted: true,
        itemType: !props.isChecked ? "todo" : "done",
        index: props.index,
      });
    }
  };
  const handleEnterKeyEvent = () => {
    if (editFieldRef.current) {
      editFieldRef.current.blur();
      if (props.isLastItem) {
        props.setShouldFocusNewItemField({
          wasCreatedNew: true,
          index: props.index,
        });
      } else {
        createNewCheckListItem(!props.isChecked, props.index);
        props.setCreatedItemInfo({
          isCreated: true,
          itemType: !props.isChecked ? "todo" : "done",
          index: props.index,
        });
      }
    }
  };

  return (
    <div className="check-list-item flex gap-2 items-center">
      <input
        type="checkbox"
        disabled={props.noteStatus !== "active"}
        onChange={handleCheckboxChange}
        onClick={(e: any) => e.stopPropagation()}
        onFocus={(e: any) => e.currentTarget.blur()}
        checked={props.isChecked as boolean}
        style={{ accentColor: bgColor, filter: "brightness(1.4)" }}
      />
      {(props.noteMode === "edit" || props.noteMode === "create") && (
        <ControlledInputField
          type="text"
          onChange={(e: any) =>
            setCheckListDesc(!props.isChecked, props.index, e.target.value)
          }
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Backspace") {
              handleBackSpaceKeyEvent();
            }
            if (e.key === "Enter") {
              handleEnterKeyEvent();
            }
          }}
          value={props.description}
          className={`grow border-none focus:outline-none bg-transparent ${props.isChecked ? `line-through` : ``}`}
          ref={editFieldRef}
        />
      )}
      {props.noteMode === "view" && (
        <p className={props.isChecked ? `line-through` : ``}>
          {props.description}
        </p>
      )}
    </div>
  );
};

export default CheckListItem;
