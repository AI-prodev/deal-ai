import React, { ChangeEvent, useState } from "react";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { useContactListsQuery } from "@/store/features/contactApi";
import { useRouter } from "next/router";
import CRMHeader from "@/components/crm/CRMHeader";
import LoadingAnimation from "@/components/LoadingAnimation";
import Error from "@/components/crm/Error";
import { paginationMessage } from "@/utils/paginationMessage";
import {
  CONTACTS_LISTS_COLUMNS,
  RECORDS_PER_PAGE_OPTIONS,
} from "@/components/crm/constants";

export const ContactLists = () => {
  const { query } = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "createdAt",
    direction: "desc",
  });

  const filters = search
    ? {
        "or:title": `regex:${search.trim()}`,
      }
    : {};

  const {
    data: contactLists,
    error,
    isLoading,
    isFetching,
    refetch: refetchContactLists,
  } = useContactListsQuery({
    contactId: query?.id as string,
    page,
    limit: pageSize,
    sort:
      sortStatus.direction === "desc"
        ? `-${sortStatus.columnAccessor}`
        : sortStatus.columnAccessor,
    filters,
  });

  const handlePageChange = (p: number): void => {
    setPage(p);
    refetchContactLists();
  };

  const handleRecordsPerPageChange = (size: number): void => {
    setPageSize(size);
    setPage(1);
    refetchContactLists();
  };

  const handleSortStatusChange = (status: DataTableSortStatus): void => {
    setSortStatus(status);
    refetchContactLists();
  };

  const handleChangeSearch = (event: ChangeEvent<HTMLInputElement>): void => {
    setSearch(event.target.value);
  };

  return (
    <div className="max-w-[768px]">
      <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-end mb-5">
        <CRMHeader />
        <div className="w-full sm:w-48 flex flex-col md:flex-row justify-end align-center mt-4.5 sm:mt-0">
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
                records={contactLists?.results || []}
                columns={CONTACTS_LISTS_COLUMNS}
                totalRecords={contactLists?.totalData || 0}
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

export default ContactLists;
