import { Dispatch, SetStateAction, useEffect, useState } from "react";
import sortBy from "lodash/sortBy";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

interface TablePropsInterface {
  propertyId: string;
  propertyPrice: number;
  properyName?: string;
  requestId: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const BuyerPropertyTable = ({
  property,
  callback,
}: {
  property: TablePropsInterface[];
  callback: Dispatch<SetStateAction<any>>;
}) => {
  const [page, setPage] = useState(1);
  const PAGE_SIZES = [10, 20, 30, 50, 100];
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [initialRecords, setInitialRecords] = useState(
    sortBy(property, "firstName")
  );
  const [recordsData, setRecordsData] = useState(initialRecords);

  const [search, setSearch] = useState("");
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "firstName",
    direction: "asc",
  });

  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  useEffect(() => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    setRecordsData([...initialRecords.slice(from, to)]);
  }, [page, pageSize, initialRecords]);

  useEffect(() => {
    if (search === "") setInitialRecords(sortBy(property, "firstName"));
    else
      setInitialRecords(() =>
        property.filter(
          item =>
            item.firstName.toLowerCase().includes(search.toLowerCase()) ||
            item.lastName.toLowerCase().includes(search.toLowerCase()) ||
            item.email.toLowerCase().includes(search.toLowerCase()) ||
            // item.businessPrice
            //   .toString()
            //   .toLowerCase()
            //   .includes(search.toLowerCase()) ||
            item.status.toLowerCase().includes(search.toLowerCase())
        )
      );
  }, [search]);

  useEffect(() => {
    const data = sortBy(initialRecords, sortStatus.columnAccessor);
    setInitialRecords(sortStatus.direction === "desc" ? data.reverse() : data);
    setPage(1);
  }, [sortStatus]);

  const formatDate = (date: string | number | Date) => {
    if (date) {
      const dt = new Date(date);
      const month =
        dt.getMonth() + 1 < 10 ? "0" + (dt.getMonth() + 1) : dt.getMonth() + 1;
      const day = dt.getDate() < 10 ? "0" + dt.getDate() : dt.getDate();
      return day + "/" + month + "/" + dt.getFullYear();
    }
    return "";
  };

  function formatToUSD(number: number) {
    if (number === 0) return "Not Disclosed";
    // Convert the number to a string and remove any existing formatting
    let formattedNumber = String(number).replace(/[^0-9.-]+/g, "");

    // Split the number into integer and decimal parts
    let parts = formattedNumber.split(".");
    let integerPart = parts[0];
    let decimalPart = parts.length > 1 ? parts[1] : "";

    // Add commas to the integer part
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    // Build the formatted string
    let formattedString = "$ " + integerPart;
    if (decimalPart.length > 0) {
      formattedString += "." + decimalPart;
    }

    return formattedString;
  }

  const formatColor = (status: string = "pending") => {
    const statusColor: Record<string, string> = {
      pending: "warning",
      approved: "success",
      completed: "info",
    };
    return statusColor[status];
  };

  const formatStatus = (status: string = "pending") => {
    return status.toLocaleUpperCase();
  };

  return (
    <div>
      <div className="panel">
        <div className="mb-5 flex flex-col gap-5 md:flex-row md:items-center">
          <h5 className="text-lg font-semibold dark:text-white-light">
            All Information Requests
          </h5>
          <div className="ltr:ml-auto rtl:mr-auto">
            <input
              type="text"
              className="min-w-{30%} form-input w-auto"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="datatables">
          <DataTable
            className="table-hover whitespace-nowrap"
            records={recordsData}
            columns={[
              {
                accessor: "firstName",
                title: "Seller First Name",
                sortable: true,
                render: ({ firstName, lastName }) => (
                  <div className="flex w-max items-center">
                    <div className="dark:text-grey-light mr-3 flex items-center justify-center rounded-full bg-white-light p-1.5 text-sm font-semibold uppercase text-gray-700">
                      {firstName[0] + lastName[0]}
                    </div>
                    <div>{firstName}</div>
                  </div>
                ),
              },
              {
                accessor: "lastName",
                title: "Seller Last Name",
                sortable: true,
              },
              {
                accessor: "email",
                title: "Seller Email",
                sortable: true,
              },
              {
                accessor: "propertyName",
                title: "Property Name",
                sortable: true,
              },
              // {
              //   accessor: "businessPrice",
              //   title: "Asking Price",
              //   sortable: true,
              //   render: ({ businessPrice }) => (
              //     <div>{formatToUSD(businessPrice)}</div>
              //   ),
              // },
              {
                accessor: "createdAt",
                title: "Request Date",
                sortable: true,
                render: ({ createdAt }) => <div>{formatDate(createdAt)}</div>,
              },
              {
                accessor: "updatedAt",
                title: "Last Update",
                sortable: true,
                render: ({ updatedAt }) => <div>{formatDate(updatedAt)}</div>,
              },
              {
                accessor: "status",
                title: "Status",
                sortable: true,
                render: ({ status }) => (
                  <span className={`badge bg-${formatColor(status)} `}>
                    {formatStatus(status)}
                  </span>
                ),
              },
              {
                accessor: "action",
                title: "Action",
                titleClassName: "!text-center",
                render: ({ requestId }) => (
                  <div className="mx-auto flex w-max items-center gap-2">
                    <Tippy content="Click to review">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="h-6 w-6 cursor-pointer"
                        onClick={() => callback(requestId)}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </Tippy>
                    {/* <Tippy content="Delete">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 cursor-pointer"
                      >
                        <path
                          opacity="0.5"
                          d="M9.17065 4C9.58249 2.83481 10.6937 2 11.9999 2C13.3062 2 14.4174 2.83481 14.8292 4"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <path
                          d="M20.5001 6H3.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <path
                          d="M18.8334 8.5L18.3735 15.3991C18.1965 18.054 18.108 19.3815 17.243 20.1907C16.378 21 15.0476 21 12.3868 21H11.6134C8.9526 21 7.6222 21 6.75719 20.1907C5.89218 19.3815 5.80368 18.054 5.62669 15.3991L5.16675 8.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <path
                          opacity="0.5"
                          d="M9.5 11L10 16"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <path
                          opacity="0.5"
                          d="M14.5 11L14 16"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </Tippy> */}
                  </div>
                ),
              },
            ]}
            totalRecords={initialRecords.length}
            recordsPerPage={pageSize}
            page={page}
            onPageChange={p => setPage(p)}
            recordsPerPageOptions={PAGE_SIZES}
            onRecordsPerPageChange={setPageSize}
            sortStatus={sortStatus}
            onSortStatusChange={setSortStatus}
            minHeight={200}
            paginationText={({ from, to, totalRecords }) =>
              `Showing  ${from} to ${to} of ${totalRecords} entries`
            }
          />
        </div>
      </div>
    </div>
  );
};

export default BuyerPropertyTable;
