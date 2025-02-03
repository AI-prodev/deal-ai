import React, { ChangeEvent, useState } from "react";
import { useCreateListMutation } from "@/store/features/listApi";
import CRMHeader from "@/components/crm/CRMHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useRouter } from "next/router";
import { CRMType } from "@/components/crm/constants";

const CreateList = () => {
  const [title, setTitle] = useState("");
  const [createList, { isLoading }] = useCreateListMutation();
  const { push } = useRouter();

  const isDisabled = !title || isLoading;

  const handleAddList = async (): Promise<void> => {
    try {
      await createList({ title });
      setTitle("");
      push("/crm/lists");
    } catch (e) {
      console.error(e);
    }
  };

  const handleChangeTitle = (event: ChangeEvent<HTMLInputElement>): void => {
    setTitle(event.target.value);
  };

  return (
    <div className="max-w-[780px]">
      <CRMHeader activeTab={CRMType.LISTS} />
      <input
        id="title"
        type="text"
        name="title"
        className="form-input mt-4.5"
        placeholder="Enter List Title"
        value={title}
        onChange={handleChangeTitle}
        required
      />
      <div className="w-full flex justify-end mt-2">
        <button
          onClick={handleAddList}
          className="w-40 rounded bg-primary px-4 py-2 text-white mt-2 disabled:opacity-70"
          disabled={isDisabled}
        >
          {isLoading ? <LoadingSpinner /> : "Add List"}
        </button>
      </div>
    </div>
  );
};

export default CreateList;
