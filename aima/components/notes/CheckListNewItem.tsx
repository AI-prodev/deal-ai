import { NoteLevelContext } from "@/utils/note";
import { useContext, useEffect, useRef, useState } from "react";

interface Props {
  setNewItemAdded: Function;
  shouldFocusNewItemField: Boolean;
  setShouldFocusNewItemField: Function;
}

const CheckListNewItem = (props: Props) => {
  const [description, setDescription] = useState("");
  const { addTodoItem }: { addTodoItem: Function } =
    useContext(NoteLevelContext);
  const ref = useRef(null);

  useEffect(() => {
    if (!description) return;

    addTodoItem(description);

    ref.current && (ref.current as any).blur();
    setDescription("");
    props.setNewItemAdded(true);
  }, [description]);
  useEffect(() => {
    if (props.shouldFocusNewItemField) {
      ref.current && (ref.current as any).focus();
      props.setShouldFocusNewItemField(false);
    }
  }, [props.shouldFocusNewItemField]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(event.target.value);
  };

  return (
    <div className="new-item flex gap-2 items-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-3 h-3"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      </svg>
      <input
        type="text"
        onChange={handleChange as any}
        value={description}
        placeholder="Add new item..."
        className={`grow border-none focus:outline-none bg-transparent`}
        ref={ref}
      />
    </div>
  );
};

export default CheckListNewItem;
