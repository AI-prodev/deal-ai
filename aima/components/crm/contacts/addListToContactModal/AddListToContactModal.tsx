import Select from "react-select";
import Modal from "@/components/Modal";
import { useState, FC, useEffect } from "react";
import { useAddListToContactMutation } from "@/store/features/listApi";
import { useContactListsQuery } from "@/store/features/contactApi";
import { useParams } from "next/navigation";
import { IAddListToContactOption } from "@/interfaces/IContact";

type AddListToContactModalProps = {
  options: IAddListToContactOption[];
  contactId: string;
  isOpen: boolean;
  setOpenModal: (arg: boolean) => void;
  refetch: any;
};

const AddListToContactModal: FC<AddListToContactModalProps> = ({
  options,
  contactId,
  isOpen,
  setOpenModal,
  refetch,
}) => {
  const params = useParams();
  const [values, setValues] = useState<IAddListToContactOption[]>([]);
  const [defaultValues, setDefaultValues] = useState<IAddListToContactOption[]>(
    []
  );
  const [addListToContact, { isLoading }] = useAddListToContactMutation();
  const {
    data: contactLists,
    isLoading: isContactListsLoading,
    refetch: refetchContactLists,
  } = useContactListsQuery(
    { contactId: params?.id as string },
    { skip: !params?.id }
  );

  const isDisabled = !values?.length || isLoading || isContactListsLoading;

  const handleCloseModal = (): void => {
    setValues([]);
    setOpenModal(false);
  };

  const addListClick = async (): Promise<void> => {
    const listIds = values.map((item: any) => item.value);
    await addListToContact({ contactId, listIds });
    await refetch();
    await refetchContactLists();
    handleCloseModal();
  };

  useEffect(() => {
    const duplicateValues: IAddListToContactOption[] = [];

    if (contactLists?.results?.length && options?.length) {
      options?.forEach(option => {
        contactLists?.results?.forEach(
          (contactListsOption: { _id: string }) => {
            if (option?.value === contactListsOption?._id) {
              duplicateValues.push(option);
            }
          }
        );
      });

      setDefaultValues(duplicateValues);
    }
  }, [contactLists?.results, options]);

  return (
    <Modal
      customClassName="w-[500px]"
      isOpen={isOpen}
      onRequestClose={handleCloseModal}
    >
      <h2 className="mb-4 text-lg font-bold text-white">Add to list</h2>
      <div>
        <div className="custom-select">
          <label className="mb-2 block text-sm font-bold text-white">
            Lists
          </label>
          <Select
            onChange={(e: any) => setValues(e)}
            defaultValue={defaultValues}
            isMulti
            options={options}
            isSearchable={false}
            isClearable
            placeholder="Select lists"
            menuPortalTarget={
              typeof window !== "undefined" ? document.body : null
            }
            menuPlacement="bottom"
            styles={{
              menuPortal: base => ({ ...base, zIndex: 9999 }),
              menu: provided => ({
                ...provided,
                backgroundColor: "#1b2e4b",
                color: "#808080",
              }),
            }}
          />
        </div>
        <div className="w-full flex justify-end mt-5">
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleCloseModal}
              className="mr-2 rounded border border-primary px-4 py-2 text-primary"
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded bg-primary px-4 py-2 text-white disabled:opacity-50"
              onClick={addListClick}
              disabled={isDisabled}
            >
              {isLoading ? "Creating..." : "Add to list"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AddListToContactModal;
