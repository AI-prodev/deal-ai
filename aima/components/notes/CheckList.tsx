import { useEffect, useState } from "react";
import CheckListItem from "./CheckListItem";
import CheckListNewItem from "./CheckListNewItem";

interface Props {
  noteMode: string;
  noteStatus: string;
  todoItems: string[] | null;
  doneItems: string[] | null;
}

const CheckList = (props: Props) => {
  const [newItemAdded, setNewItemAdded] = useState(false);
  const [deletedItemInfo, setDeletedItemInfo] = useState({
    isDeleted: false,
    itemType: "", // 'todo' or 'done'
    index: -1,
  });
  const [createdItemInfo, setCreatedItemInfo] = useState({
    isCreated: false,
    itemType: "", // 'todo' or 'done'
    index: -1,
  });
  const [willFocus, setWillFocus] = useState({
    itemType: "", // 'todo' or 'done'
    index: -1,
  });
  const [shouldFocusNewItemField, setShouldFocusNewItemField] = useState(false);

  useEffect(() => {
    if (deletedItemInfo.isDeleted) {
      setWillFocus({
        itemType: deletedItemInfo.itemType,
        index: deletedItemInfo.index === 0 ? -1 : deletedItemInfo.index - 1,
      });
    }
  }, [deletedItemInfo]);
  useEffect(() => {
    if (createdItemInfo.isCreated) {
      setWillFocus({
        itemType: createdItemInfo.itemType,
        index: createdItemInfo.index + 1,
      });
    }
  }, [createdItemInfo]);
  useEffect(() => {
    if (willFocus.itemType !== "" && willFocus.index !== -1) {
      setDeletedItemInfo({
        isDeleted: false,
        itemType: "",
        index: -1,
      });
    }
  }, [willFocus]);

  return (
    <div className="check-list">
      {props.todoItems?.map((itemStr: string, index: number) => (
        <CheckListItem
          index={index}
          isChecked={false}
          noteStatus={props.noteStatus}
          description={itemStr}
          key={`check-list-item-${index}`}
          noteMode={props.noteMode}
          newItemAdded={newItemAdded}
          isLastItem={
            (props.todoItems && index === props.todoItems.length - 1) as Boolean
          }
          setDeletedItemInfo={setDeletedItemInfo}
          willFocus={willFocus}
          setShouldFocusNewItemField={setShouldFocusNewItemField}
          setCreatedItemInfo={setCreatedItemInfo}
        />
      ))}
      {(props.noteMode === "edit" || props.noteMode === "create") && (
        <>
          <CheckListNewItem
            setNewItemAdded={setNewItemAdded}
            shouldFocusNewItemField={shouldFocusNewItemField}
            setShouldFocusNewItemField={setShouldFocusNewItemField}
          />
          <br />
        </>
      )}
      {props.doneItems?.map((itemStr: string, index: number) => (
        <CheckListItem
          index={index}
          isChecked={true}
          noteStatus={props.noteStatus}
          description={itemStr}
          key={`check-list-item-${index}`}
          noteMode={props.noteMode}
          newItemAdded={newItemAdded}
          isLastItem={
            (props.todoItems && index === props.todoItems.length - 1) as Boolean
          }
          setDeletedItemInfo={setDeletedItemInfo}
          willFocus={willFocus}
          setShouldFocusNewItemField={setShouldFocusNewItemField}
          setCreatedItemInfo={setCreatedItemInfo}
        />
      ))}
    </div>
  );
};

export default CheckList;
