import React, { ChangeEvent, useState } from "react";
import {
  CRMBroadcastType,
  RECORDS_PER_PAGE_OPTIONS,
  REPORTS_COLUMNS,
  SendEmailStatus,
} from "@/components/crm/constants";
import BroadcastTabsWrapper from "@/components/crm/broadcast/BroadcastTabsWrapper";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { useGetEmailsQuery } from "@/store/features/broadcastApi";
import type { Email } from "@/interfaces/IBroadcast";
import { useRouter } from "next/router";
import LoadingAnimation from "@/components/LoadingAnimation";
import Error from "@/components/crm/Error";
import { paginationMessage } from "@/utils/paginationMessage";

const Reports = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "createdAt",
    direction: "desc",
  });

  const { push } = useRouter();

  const {
    data: reports,
    error,
    isLoading,
    isFetching,
  } = useGetEmailsQuery({
    status: SendEmailStatus.report,
    page,
    limit: pageSize,
    sort:
      sortStatus.direction === "desc"
        ? `-${sortStatus.columnAccessor}`
        : sortStatus.columnAccessor,
    search,
  });

  const handlePageChange = (page: number): void => {
    setPage(page);
  };

  const handleRecordsPerPageChange = (size: number): void => {
    setPageSize(size);
    setPage(1);
  };

  const handleSortStatusChange = (status: DataTableSortStatus): void => {
    setSortStatus(status);
  };

  const handleChangeSearch = (event: ChangeEvent<HTMLInputElement>): void => {
    setSearch(event.target.value);
  };

  const handleClickRow = (email: Email): void => {
    push(`/crm/broadcast/reports/${email?._id}`);
  };

  return (
    <BroadcastTabsWrapper activeTab={CRMBroadcastType.REPORTS}>
      <div className="datatables datatables-fields-bg">
        {isLoading ? (
          <LoadingAnimation className="max-w-[9rem] !block mx-auto" />
        ) : // prettier-ignore
        //@ts-ignore
        error ? <Error message={error?.data?.error || "Something went wrong, please try again"} /> : (
            <>
              <div className="mb-4.5 flex flex-col gap-5 md:flex-row md:items-center">
                <div className="w-full ltr:ml-auto rtl:mr-auto md:w-1/3">
                  <input
                    type="text"
                    className="form-input w-full"
                    placeholder="Search by title or subject"
                    value={search}
                    onChange={handleChangeSearch}
                  />
                </div>
              </div>
              <div className="table-responsive mb-5">
                <DataTable
                  highlightOnHover
                  fetching={isFetching}
                  records={reports?.results || []}
                  columns={REPORTS_COLUMNS}
                  totalRecords={reports?.totalCount || 0}
                  recordsPerPage={pageSize}
                  page={page}
                  minHeight={200}
                  height={700}
                  loaderVariant="dots"
                  loaderSize="md"
                  loaderColor="#1b2e4b"
                  onRowClick={handleClickRow}
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
    </BroadcastTabsWrapper>
  );
};

export default Reports;
