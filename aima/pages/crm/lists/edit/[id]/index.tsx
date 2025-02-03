"use client";
import React, { useEffect, useState, ChangeEvent } from "react";
import {
  useUpdateListMutation,
  useGetOneListQuery,
  useGetOneListContactsQuery,
} from "@/store/features/listApi";
import LoadingAnimation from "@/components/LoadingAnimation";
import { useRouter } from "next/router";
import { useParams } from "next/navigation";
import Error from "@/components/crm/Error";
import CRMHeader from "@/components/crm/CRMHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import { CRMType, LIST_CONTACTS_COLUMNS } from "@/components/crm/constants";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import Dropdown from "@/components/Dropdown";
import { useDeleteListMutation } from "@/store/features/listApi";

const EditList = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [search, setSearch] = useState("");
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "createdAt",
    direction: "desc",
  });

  const filters = search
    ? {
        "or:email": `regex:${search.trim()}`,
        "or:firstName": `regex:${search.trim()}`,
        "or:lastName": `regex:${search.trim()}`,
      }
    : {};

  const [title, setTitle] = useState("");
  const { push } = useRouter();
  const params = useParams();
  const listId = params?.id as string;
  const [updateList, { isLoading: isUpdateListLoading }] =
    useUpdateListMutation();
  const {
    data,
    isFetching,
    refetch: refetchOneList,
  } = useGetOneListQuery({ listId }, { skip: !listId });
  const {
    data: listContacts,
    isFetching: isListContactsFetching,
    isLoading: isListContactsLoading,
    error,
    refetch: refetchListContacts,
  } = useGetOneListContactsQuery(
    {
      listId,
      sort:
        sortStatus.direction === "desc"
          ? `-${sortStatus.columnAccessor}`
          : sortStatus.columnAccessor,
      filters,
    },
    { skip: !listId }
  );

  const isListContactsTableLoading = isListContactsLoading || !listId;
  const isUpdateListButtonLoading = isUpdateListLoading || !listId;
  const isDisabledUpdateListButton =
    !title || !isEditMode || isUpdateListLoading;

  const editClick = async () => {
    try {
      await updateList({ id: listId as string, data: { title } });
      await refetchOneList();
    } catch (e) {
      console.error(e);
    }
  };

  const [deleteList] = useDeleteListMutation();

  const handleDeleteList = async (listId: string) => {
    try {
      if (confirm("Are you sure?")) {
        await deleteList(listId);
        push("/crm/lists");
      }
    } catch (error) {
      console.error(`error: ${error}`);
    }
  };

  const toggleIsEditMode = () => setIsEditMode(prev => !prev);

  useEffect(() => {
    if (data?.title) {
      setTitle(data?.title);
    }
  }, [data]);

  const handleSortStatusChange = (status: DataTableSortStatus): void => {
    setSortStatus(status);
    refetchListContacts();
  };

  const handleChangeTitle = (event: ChangeEvent<HTMLInputElement>): void => {
    setTitle(event.target.value);
  };

  const handleChangeSearch = (event: ChangeEvent<HTMLInputElement>): void => {
    setSearch(event.target.value);
  };

  return (
    <div className="max-w-[780px]">
      <CRMHeader activeTab={CRMType.LISTS} />
      <div className="w-full flex-column mt-4.5">
        <input
          id="title"
          type="text"
          name="title"
          className="form-input disabled:opacity-70"
          placeholder="Enter List Title"
          value={title}
          onChange={handleChangeTitle}
          required
          disabled={!isEditMode}
        />
      </div>

      <div className="w-full flex justify-end">
        <button
          onClick={editClick}
          className="w-[122px] rounded bg-primary px-4 py-2 text-white mt-2 mr-2 disabled:opacity-70"
          disabled={isDisabledUpdateListButton}
        >
          {isUpdateListButtonLoading ? <LoadingSpinner /> : "Update List"}
        </button>
        <div className="dropdown mt-2">
          <Dropdown
            offset={[0, 5]}
            placement="bottom-start"
            button={
              <button
                type="button"
                className="rounded bg-primary px-4 py-2 text-white"
              >
                Manage List
              </button>
            }
          >
            <ul>
              <li>
                <button type="button" onClick={toggleIsEditMode}>
                  Edit
                </button>
              </li>
              <li>
                <button type="button" onClick={() => handleDeleteList(listId)}>
                  Delete
                </button>
              </li>
            </ul>
          </Dropdown>
        </div>
      </div>
      <div className="w-full flex flex-col md:flex-row">
        <div className="w-full sm:w-[252px] ltr:ml-auto rtl:mr-auto my-4.5">
          <input
            type="text"
            className="form-input w-full"
            placeholder="Search by first name, last name, or email"
            value={search}
            onChange={handleChangeSearch}
          />
        </div>
      </div>

      <div className="datatables">
        {isListContactsTableLoading ? (
          <LoadingAnimation className="max-w-[9rem] !block mx-auto" />
        ) : error ? (
          <Error
            message={
              //@ts-ignore
              error?.data?.error || "Something went wrong, please try again"
            }
          />
        ) : (
          <div className="table-responsive mb-5">
            <DataTable
              highlightOnHover
              fetching={isListContactsFetching}
              records={listContacts || []}
              columns={LIST_CONTACTS_COLUMNS}
              totalRecords={listContacts?.length || 0}
              minHeight={200}
              height={700}
              loaderVariant="dots"
              loaderSize="md"
              loaderColor="#1b2e4b"
              loaderBackgroundBlur={0}
              sortStatus={sortStatus}
              onSortStatusChange={handleSortStatusChange}
              idAccessor="_id"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EditList;
