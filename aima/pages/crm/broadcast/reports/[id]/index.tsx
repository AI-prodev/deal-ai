import { useRouter } from "next/router";
import {
  CRMBroadcastType,
  RECORDS_PER_PAGE_OPTIONS,
  REPORT_COLUMNS,
} from "@/components/crm/constants";
import BroadcastTabsWrapper from "@/components/crm/broadcast/BroadcastTabsWrapper";
import {
  useGetReportListQuery,
  useGetReportStatsQuery,
} from "@/store/features/broadcastApi";
import ReportDetailsChart from "@/components/crm/broadcast/ReportDetailsChart";
import React, { ChangeEvent, useState } from "react";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import LoadingAnimation from "@/components/LoadingAnimation";
import Error from "@/components/crm/Error";
import { paginationMessage } from "@/utils/paginationMessage";

const Report = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "name",
    direction: "desc",
  });

  const { query } = useRouter();
  const emailId = query?.id as string;

  const {
    data: reportList,
    error: errorReportList,
    isLoading: isReportListLoading,
    isFetching: isReportListFetching,
  } = useGetReportListQuery(
    {
      emailId,
      page,
      limit: pageSize,
      sort:
        sortStatus.direction === "desc"
          ? `-${sortStatus.columnAccessor}`
          : sortStatus.columnAccessor,
      search,
    },
    { skip: !emailId }
  );

  const {
    data: reportStats,
    error: errorReportStats,
    isFetching: isReportStatsFetching,
    isLoading: isReportStatsLoading,
  } = useGetReportStatsQuery({ emailId }, { skip: !emailId });

  const openRate = Number.parseFloat(reportStats?.openRate ?? "0");
  const clickRate = Number.parseFloat(reportStats?.clickRate ?? "0");

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

  return (
    <BroadcastTabsWrapper activeTab={CRMBroadcastType.REPORTS}>
      {!isReportStatsLoading &&
        !isReportStatsFetching &&
        !errorReportStats &&
        reportStats && (
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/2">
              <h2 className="font-semibold text-base">{reportStats?.title}</h2>
              <div>
                <div className="flex items-center my-1">
                  <p className="min-w-28">Sent</p>
                  <p>
                    {reportStats?.sentAt
                      ? new Date(reportStats?.sentAt).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
                <div className="flex items-center mb-1">
                  <p className="min-w-28">Recipients</p>
                  <p>{reportStats?.recipientsCount}</p>
                </div>
                {/*<div className="flex items-center mb-1">*/}
                {/*  <p className="min-w-28">Opens</p>*/}
                {/*  <p>{reportStats?.opensCount}</p>*/}
                {/*</div>*/}
                {/*<div className="flex items-center mb-1">*/}
                {/*  <p className="min-w-28">Bounced</p>*/}
                {/*  <p>{reportStats?.bounceCount}</p>*/}
                {/*</div>*/}
                {/*<div className="flex items-center mb-1">*/}
                {/*  <p className="min-w-28">Clicks</p>*/}
                {/*  <p>{reportStats?.clickCount}</p>*/}
                {/*</div>*/}
                <div className="flex items-center mb-1">
                  <p className="min-w-28">Delivered</p>
                  <p>{reportStats?.deliveredCount}</p>
                </div>
              </div>
            </div>
            {/*<div className="w-full md:w-1/2 flex items-center justify-start md:justify-between mt-4.5 md:mt-0">*/}
            {/*  <div>*/}
            {/*    <h2 className="font-semibold text-base mb-2 text-center">Open Rate {reportStats?.openRate}%</h2>*/}
            {/*    <ReportDetailsChart data={[{ name: "Open", y: openRate}, {name: "total", y: 100 - openRate}]} />*/}
            {/*  </div>*/}
            {/*  <div>*/}
            {/*    <h2 className="font-semibold text-base mb-2 text-center">Click Rate {reportStats?.clickRate}%</h2>*/}
            {/*    <ReportDetailsChart data={[{ name: "Click", y: clickRate}, {name: "total", y: 100 - clickRate}]} />*/}
            {/*  </div>*/}
            {/*</div>*/}
          </div>
        )}
      <div className="datatables datatables-fields-bg">
        {isReportListLoading || !emailId ? (
          <LoadingAnimation className="max-w-[9rem] !block mx-auto" />
        ) : // prettier-ignore
        //@ts-ignore
        errorReportList ? <Error message={errorReportList?.data?.error || "Something went wrong, please try again"} />
          : (
          <>
            <div className="table-responsive mb-5">
              <div className="my-4.5 flex flex-col gap-5 md:flex-row md:items-center">
                <div className="w-full ltr:ml-auto rtl:mr-auto md:w-1/3">
                  <input
                    type="text"
                    className="form-input w-full"
                    placeholder="Search by name or email"
                    value={search}
                    onChange={handleChangeSearch}
                  />
                </div>
              </div>
              <DataTable
                fetching={isReportListFetching}
                records={reportList?.results || []}
                columns={REPORT_COLUMNS}
                totalRecords={reportList?.totalCount || 0}
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
    </BroadcastTabsWrapper>
  );
};

export default Report;
