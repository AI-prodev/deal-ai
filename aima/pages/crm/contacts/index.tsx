import { DataTable, DataTableSortStatus } from "mantine-datatable";
import React, { ChangeEvent, useEffect, useState } from "react";
import { useListContactsQuery } from "@/store/features/contactApi";
import withAuth from "@/helpers/withAuth";
import { USER_ROLES } from "@/utils/roles";
import { useRouter } from "next/router";
import { IContact } from "@/interfaces/IContact";
import CRMHeader from "@/components/crm/CRMHeader";
import { paginationMessage } from "@/utils/paginationMessage";
import LoadingAnimation from "@/components/LoadingAnimation";
import Error from "@/components/crm/Error";
import {
  CONTACTS_COLUMNS,
  RECORDS_PER_PAGE_OPTIONS,
} from "@/components/crm/constants";

const Contacts = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
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
  const { push } = useRouter();
  const {
    data: contacts,
    error,
    isLoading,
    isFetching,
    refetch: refetchSales,
  } = useListContactsQuery({
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
  useEffect(() => {
    refetchSales();
  }, []);

  const navigateToAddContact = (): void => {
    push("/crm/contacts/add");
  };

  const handleClickRow = (contact: IContact): void => {
    push(`/crm/contacts/edit/${contact?._id}`);
  };

  const handleChangeSearch = (event: ChangeEvent<HTMLInputElement>): void => {
    setSearch(event.target.value);
  };

  return (
    <div className="max-w-[780px]">
      <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-end mb-5">
        <CRMHeader />
        <div className="w-full flex justify-end">
          <button
            onClick={navigateToAddContact}
            className="w-fit md:w-48 rounded bg-primary px-4 py-2 text-white mt-4.5 sm:mt-0"
          >
            Add Contact
          </button>
        </div>
      </div>
      <div className="mb-4.5 flex flex-col gap-5 md:flex-row md:items-center">
        <div className="w-full ltr:ml-auto rtl:mr-auto md:w-48">
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
                columns={CONTACTS_COLUMNS}
                totalRecords={contacts?.totalData || 0}
                recordsPerPage={pageSize}
                onRowClick={handleClickRow}
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

export default withAuth(Contacts, USER_ROLES);
