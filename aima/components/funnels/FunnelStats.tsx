import { useState, useMemo } from "react";
import { DataTable } from "mantine-datatable";
import { IFunnel } from "@/interfaces/IFunnel";
import { createFunnelApi } from "@/store/features/projectApi";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.css";
import { useSelector } from "react-redux";
import { IRootState } from "@/store";
import { endOfMonth, format, startOfMonth } from "date-fns";
import clsx from "clsx";

const BackgroundColorsForColumn = {
  pageTitle: "#101725",
  pageView: "#151E30",
  contactSubmission: "#1A1E38",
  orders: "#151E30",
  recurringOrders: "#1A1E38",
  earningsPerPageView: "#151E30",
};

const getBackgroundColorStyleForColumn = (
  column: keyof typeof BackgroundColorsForColumn
) => {
  return {
    backgroundColor: `${BackgroundColorsForColumn[column]} !important`,
    //color: "black !important",
  };
};

const FunnelStats = ({ funnel }: { funnel: IFunnel }) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  // const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
  //   columnAccessor: "_id",
  //   direction: "asc",
  // })

  const isLegacyFunnel = useMemo(() => {
    if (!funnel) {
      return false;
    }
    return new Date(funnel.createdAt) < new Date("2024-02-03T00:00:00.000Z"); // this is when stats started
  }, [funnel]);

  const isRtl =
    useSelector((state: IRootState) => state.themeConfig.rtlClass) === "rtl"
      ? true
      : false;
  const [dateRange, setDateRange] = useState([
    format(startOfMonth(new Date()), "yyyy-MM-dd"),
    format(endOfMonth(new Date()), "yyyy-MM-dd"),
  ]);
  const {
    data,
    error,
    isLoading,
    isFetching,
    refetch: refetchContacts,
  } = createFunnelApi.useListFunnelStatsQuery({
    funnelId: funnel._id,
    page,
    limit: pageSize,
    filters: {
      startDate: dateRange?.[0],
      endDate: dateRange?.[1],
    },
    // sort:
    //   sortStatus.direction === "desc"
    //     ? `-${sortStatus.columnAccessor}`
    //     : sortStatus.columnAccessor,
  });

  // const handlePageChange = (p: number) => {
  //   setPage(p)
  //   refetchContacts()
  // }

  // const handleRecordsPerPageChange = (size: number) => {
  //   setPageSize(size)
  //   setPage(1)

  //   refetchContacts()
  // }

  // const handleSortStatusChange = (status: DataTableSortStatus) => {
  //   setSortStatus(status)
  //   refetchContacts()
  // }

  if (isLoading) {
    return <div className="m-4">Loading...</div>;
  }

  if (error) {
    return <div className="m-4">Error occurred while loading data</div>;
  }

  if (!funnel) {
    return <></>;
  }

  return (
    <div className="custom-select overflow-auto pt-3">
      {isLegacyFunnel && (
        <div className="text-xs w-full flex justify-center">
          Funnel stats began collection on February 3, 2024
        </div>
      )}
      <div className="panel mt-3">
        <div className="datatables">
          {isLoading ? (
            <p>Loading...</p>
          ) : error ? (
            <p>Error: </p>
          ) : (
            <>
              {/* <div className="-m-2 mb-5 flex flex-wrap text-center">
                <div className="w-1/2 p-2 lg:w-1/3">
                  <div className="grid h-full place-items-center rounded border border-white-light bg-white p-5 shadow-[4px_6px_10px_-3px_#bfc9d4] dark:border-[#1b2e4b] dark:bg-[#191e3a] dark:text-white-light dark:shadow-none">
                    <h2 className="text-3xl font-medium">
                      {data?.totalPageViewsCount
                        ? data?.totalPageViewsCount
                        : "-"}
                    </h2>
                    <p className="leading-relaxed">Total Page Views</p>
                  </div>
                </div>

                <div className="w-1/2 p-2 lg:w-1/3">
                  <div className="grid h-full place-items-center rounded border border-white-light bg-white p-5 shadow-[4px_6px_10px_-3px_#bfc9d4] dark:border-[#1b2e4b] dark:bg-[#191e3a] dark:text-white-light dark:shadow-none">
                    <h2 className="text-3xl font-medium text-white">
                      {data?.uniquePageViewsCount
                        ? data?.uniquePageViewsCount
                        : "-"}
                    </h2>
                    <p className="leading-relaxed">Unique Page Views</p>
                  </div>
                </div>

                <div className="w-1/2 p-2 lg:w-1/3">
                  <div className="grid h-full place-items-center rounded border border-white-light bg-white p-5 shadow-[4px_6px_10px_-3px_#bfc9d4] dark:border-[#1b2e4b] dark:bg-[#191e3a] dark:text-white-light dark:shadow-none">
                    <h2 className="text-3xl font-medium text-white">
                      {data?.totalContactsCount
                        ? data?.totalContactsCount
                        : "-"}
                    </h2>
                    <p className="leading-relaxed">
                      Total Contact Form Submission
                    </p>
                  </div>
                </div>
              </div> */}

              <div className="-m-2 mb-5 flex flex-wrap text-center">
                <div className="w-1/2 p-2 lg:w-1/3">
                  <div className="grid h-full place-items-center rounded border border-white-light bg-white p-5 shadow-[4px_6px_10px_-3px_#bfc9d4] dark:border-[#1b2e4b] dark:bg-[#191e3a] dark:text-white-light dark:shadow-none">
                    <h2 className="text-3xl font-medium">
                      {data?.totalSalesAmount && data?.totalContactsCount
                        ? `$${(
                            data?.totalSalesAmount /
                            (data?.totalContactsCount ?? 0)
                          ).toFixed(2)}`
                        : "$0.00"}
                    </h2>
                    <p className="leading-relaxed">Earnings per click</p>
                  </div>
                </div>
                <div className="w-1/2 p-2 lg:w-1/3">
                  <div className="grid h-full place-items-center rounded border border-white-light bg-white p-5 shadow-[4px_6px_10px_-3px_#bfc9d4] dark:border-[#1b2e4b] dark:bg-[#191e3a] dark:text-white-light dark:shadow-none">
                    <h2 className="text-3xl font-medium">
                      {data?.totalSalesAmount
                        ? `$${data?.totalSalesAmount}`
                        : "$0.00"}
                    </h2>
                    <p className="leading-relaxed">Gross Sales</p>
                  </div>
                </div>
                <div className="w-1/2 p-2 lg:w-1/3">
                  <div className="grid h-full place-items-center rounded border border-white-light bg-white p-5 shadow-[4px_6px_10px_-3px_#bfc9d4] dark:border-[#1b2e4b] dark:bg-[#191e3a] dark:text-white-light dark:shadow-none">
                    <h2 className="text-3xl font-medium">
                      {data?.totalSalesAmount && data?.totalSalesCount
                        ? `$${(
                            data?.totalSalesAmount /
                            (data?.totalSalesCount ?? 0)
                          ).toFixed(2)}`
                        : "$0.00"}
                    </h2>
                    <p className="leading-relaxed">Average Cart Value</p>
                  </div>
                </div>
              </div>

              <div className="mb-5 flex justify-end">
                <Flatpickr
                  options={{
                    mode: "range",
                    dateFormat: "Y-m-d",
                    position: isRtl ? "auto right" : "auto left",
                  }}
                  defaultValue={dateRange?.join(" to ")}
                  className="form-input"
                  onChange={date => {
                    if (date[0] && date[1]) {
                      setDateRange([
                        format(date[0], "yyyy-MM-dd"),
                        format(date[1], "yyyy-MM-dd"),
                      ]);
                    }
                  }}
                  placeholder="Select Date Range"
                />
              </div>

              <div className="datatables table-responsive  mb-5 ">
                <DataTable
                  highlightOnHover
                  fetching={isFetching}
                  records={data.pageStats}
                  groups={[
                    {
                      id: "page-title",
                      title: "",
                      sx: getBackgroundColorStyleForColumn("pageTitle"),
                      columns: [
                        {
                          accessor: "pageTitle",
                          title: "",
                          cellsSx:
                            getBackgroundColorStyleForColumn("pageTitle"),
                          titleSx:
                            getBackgroundColorStyleForColumn("pageTitle"),
                        },
                      ],
                    },
                    {
                      id: "page-views",
                      title: "Page Views",
                      style: { textAlign: "center" },
                      sx: getBackgroundColorStyleForColumn("pageView"),
                      columns: [
                        {
                          accessor: "pageViews.totalViews",
                          title: "All",
                          textAlignment: "center",
                          render: (value: any) => {
                            if (!value?.pageViews?.totalViews) return "0";
                            return value?.pageViews?.totalViews;
                          },
                          titleSx: getBackgroundColorStyleForColumn("pageView"),
                          cellsSx: getBackgroundColorStyleForColumn("pageView"),
                        },
                        {
                          accessor: "pageViews.uniqueViews",
                          title: "Uniques",
                          textAlignment: "center",
                          render: (value: any) => {
                            if (!value?.pageViews?.uniqueViews) return "0";
                            return value?.pageViews?.uniqueViews;
                          },
                          titleSx: getBackgroundColorStyleForColumn("pageView"),
                          cellsSx: getBackgroundColorStyleForColumn("pageView"),
                        },
                      ],
                    },
                    {
                      id: "contact-views",
                      title: "Opt-Ins",
                      style: { textAlign: "center" },
                      sx: getBackgroundColorStyleForColumn("contactSubmission"),
                      columns: [
                        {
                          accessor: "contacts.totalContacts",
                          title: "All",
                          textAlignment: "center",
                          render: (value: any) => {
                            if (!value?.contacts?.totalContacts) return "-";
                            return value?.contacts?.totalContacts;
                          },
                          titleSx:
                            getBackgroundColorStyleForColumn(
                              "contactSubmission"
                            ),
                          cellsSx:
                            getBackgroundColorStyleForColumn(
                              "contactSubmission"
                            ),
                        },
                        {
                          accessor: "contacts.submissionRate",
                          title: "Rate",
                          textAlignment: "center",
                          render: (value: any) => {
                            if (!value?.contacts?.submissionRate) return "-";
                            return `${value?.contacts?.submissionRate}%`;
                          },
                          titleSx:
                            getBackgroundColorStyleForColumn(
                              "contactSubmission"
                            ),
                          cellsSx:
                            getBackgroundColorStyleForColumn(
                              "contactSubmission"
                            ),
                        },
                      ],
                    },
                    {
                      id: "orders",
                      title: "Sales",
                      style: { textAlign: "center" },
                      sx: getBackgroundColorStyleForColumn("orders"),
                      columns: [
                        {
                          accessor: "sales.totalSales",
                          title: "Count",
                          textAlignment: "center",
                          render: (value: any) => {
                            if (!value?.sales?.totalSales) return "-";
                            return value?.sales?.totalSales;
                          },
                          titleSx: getBackgroundColorStyleForColumn("orders"),
                          cellsSx: getBackgroundColorStyleForColumn("orders"),
                        },
                        {
                          accessor: "sales.saleRate",
                          title: "Rate",
                          textAlignment: "center",
                          render: (value: any) => {
                            try {
                              return `${value.sales.saleRate.toFixed(2)}%`;
                            } catch (e) {
                              return "-";
                            }
                          },
                          titleSx: getBackgroundColorStyleForColumn("orders"),
                          cellsSx: getBackgroundColorStyleForColumn("orders"),
                        },
                        {
                          accessor: "sales.saleAmount",
                          title: "Value",
                          textAlignment: "center",
                          titleSx: getBackgroundColorStyleForColumn("orders"),
                          render: (value: any) => {
                            try {
                              return `$${value.sales.saleAmount.toFixed(2)}`;
                            } catch (e) {
                              return "-";
                            }
                          },
                          cellsSx: getBackgroundColorStyleForColumn("orders"),
                        },
                      ],
                    },
                    {
                      id: "recurring-orders",
                      title: "Recurring",
                      style: { textAlign: "center" },
                      sx: getBackgroundColorStyleForColumn("recurringOrders"),
                      columns: [
                        {
                          accessor: "sales.recurringSalesCount",
                          title: "Count",
                          textAlignment: "center",
                          render: (value: any) => {
                            if (!value?.sales?.recurringSalesCount) return "-";
                            return value?.sales?.recurringSalesCount;
                          },
                          titleSx:
                            getBackgroundColorStyleForColumn("recurringOrders"),
                          cellsSx:
                            getBackgroundColorStyleForColumn("recurringOrders"),
                        },
                        {
                          accessor: "sales.recurringSalesAmount",
                          title: "Value",
                          textAlignment: "center",
                          render: (value: any) => {
                            if (!value?.sales?.recurringSalesAmount) return "-";
                            return `$${value?.sales?.recurringSalesAmount?.toFixed(
                              2
                            )}`;
                          },
                          titleSx:
                            getBackgroundColorStyleForColumn("recurringOrders"),
                          cellsSx:
                            getBackgroundColorStyleForColumn("recurringOrders"),
                        },
                      ],
                    },
                    {
                      id: "earnings-per-page-view",
                      title: "Earnings / Pageview",
                      style: { textAlign: "center" },
                      sx: getBackgroundColorStyleForColumn(
                        "earningsPerPageView"
                      ),
                      columns: [
                        {
                          accessor: "earningsPerView.totalEarningsPerView",
                          title: "All",
                          textAlignment: "center",
                          render: (value: any) => {
                            if (
                              !(
                                value?.sales?.saleAmount /
                                value?.pageViews?.totalViews
                              )
                            )
                              return "-";
                            return `$${(
                              value?.sales?.saleAmount /
                              value?.pageViews?.totalViews
                            ).toFixed(2)}`;
                          },
                          titleSx: getBackgroundColorStyleForColumn(
                            "earningsPerPageView"
                          ),
                          cellsSx: getBackgroundColorStyleForColumn(
                            "earningsPerPageView"
                          ),
                        },
                        {
                          accessor: "earningsPerView.earningsPerView",
                          title: "Uniques",
                          textAlignment: "center",
                          render: (value: any) => {
                            if (
                              !(
                                value?.sales?.saleAmount /
                                value?.pageViews?.uniqueViews
                              )
                            )
                              return "-";
                            return `$${(
                              value?.sales?.saleAmount /
                              value?.pageViews?.uniqueViews
                            ).toFixed(2)}`;
                          },
                          titleSx: getBackgroundColorStyleForColumn(
                            "earningsPerPageView"
                          ),
                          cellsSx: getBackgroundColorStyleForColumn(
                            "earningsPerPageView"
                          ),
                        },
                      ],
                    },
                  ]}
                  // totalRecords={data?.totalPagesCount || 0}
                  // recordsPerPage={pageSize}
                  // page={page}
                  minHeight={200}
                  // height={600}
                  loaderVariant="dots"
                  loaderSize="md"
                  loaderColor="#1b2e4b"
                  loaderBackgroundBlur={0}
                  // onPageChange={handlePageChange}
                  // recordsPerPageOptions={[5, 10, 20, 50]}
                  // onRecordsPerPageChange={handleRecordsPerPageChange}
                  // sortStatus={sortStatus}
                  // onSortStatusChange={handleSortStatusChange}
                  idAccessor="_id"
                  // paginationText={({ from, to, totalRecords }: any) =>
                  //   `Showing  ${from} to ${to} of ${totalRecords} entries`
                  // }
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FunnelStats;
