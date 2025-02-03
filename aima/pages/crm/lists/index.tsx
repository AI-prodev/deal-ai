import { DataTable, DataTableSortStatus } from "mantine-datatable";
import React, { ChangeEvent, useState } from "react";
import withAuth from "@/helpers/withAuth";
import { USER_ROLES } from "@/utils/roles";
import { ILists } from "@/interfaces/Ilists";
import { useListListsQuery } from "@/store/features/listApi";
import { useRouter } from "next/router";
import {
  CRMType,
  LISTS_COLUMNS,
  RECORDS_PER_PAGE_OPTIONS,
} from "@/components/crm/constants";
import CRMHeader from "@/components/crm/CRMHeader";
import { paginationMessage } from "@/utils/paginationMessage";
import LoadingAnimation from "@/components/LoadingAnimation";
import Error from "@/components/crm/Error";

const Lists = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "createdAt",
    direction: "desc",
  });
  const { push } = useRouter();
  const filters = search
    ? {
        "or:title": `regex:${search.trim()}`,
      }
    : {};
  const {
    data: contacts,
    error,
    isLoading,
    isFetching,
    refetch: refetchSales,
  } = useListListsQuery({
    page,
    limit: pageSize,
    sort:
      sortStatus.direction === "desc"
        ? `-${sortStatus.columnAccessor}`
        : sortStatus.columnAccessor,
    filters,
  });

  const handlePageChange = (p: number) => {
    setPage(p);
    refetchSales();
  };

  const handleRecordsPerPageChange = (size: number) => {
    setPageSize(size);
    setPage(1);
    refetchSales();
  };

  const handleSortStatusChange = (status: DataTableSortStatus) => {
    setSortStatus(status);
    refetchSales();
  };

  const handleChangeSearch = (event: ChangeEvent<HTMLInputElement>): void => {
    setSearch(event.target.value);
  };

  const navigateToAddList = (): void => {
    push("/crm/lists/add");
  };

  const handleClickRow = (list: ILists): void => {
    push(`/crm/lists/edit/${list._id}`);
  };

  return (
    <div className="max-w-[780px]">
      <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-end mb-5">
        <CRMHeader activeTab={CRMType.LISTS} />
        <div className="w-full flex justify-end">
          <button
            onClick={navigateToAddList}
            className="w-fit md:w-48 rounded bg-primary px-4 py-2 text-white mt-4.5 sm:mt-0"
          >
            Add List
          </button>
        </div>
      </div>
      <div className="mb-4.5 flex flex-col gap-5 md:flex-row md:items-center">
        <div className="w-full ltr:ml-auto rtl:mr-auto md:w-48">
          <input
            type="text"
            className="form-input w-full"
            placeholder="Search by title"
            value={search}
            onChange={handleChangeSearch}
          />
        </div>
      </div>

      <div className="datatables">
        {isLoading ? (
          <LoadingAnimation className="max-w-[9rem] !block mx-auto" />
        ) : error ? (
          <Error
            message={
              //@ts-ignore
              error?.data?.error || "Something went wrong, please try again"
            }
          />
        ) : (
          <>
            <div className="table-responsive mb-5">
              <DataTable
                highlightOnHover
                fetching={isFetching}
                records={contacts?.results || []}
                columns={LISTS_COLUMNS}
                totalRecords={contacts?.totalData || 0}
                recordsPerPage={pageSize}
                page={page}
                minHeight={200}
                height={700}
                loaderVariant="dots"
                loaderSize="md"
                loaderColor="#1b2e4b"
                loaderBackgroundBlur={0}
                onPageChange={handlePageChange}
                recordsPerPageOptions={RECORDS_PER_PAGE_OPTIONS}
                onRecordsPerPageChange={handleRecordsPerPageChange}
                onRowClick={handleClickRow}
                sortStatus={sortStatus}
                onSortStatusChange={handleSortStatusChange}
                idAccessor="_id"
                paginationText={paginationMessage}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default withAuth(Lists, USER_ROLES);
