import { Dispatch, SetStateAction, useEffect, useState } from "react";
import sortBy from "lodash/sortBy";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

interface TablePropsInterface {
  requests: {
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
  }[];
  propertyName?: string;
  tableName?: string;
}

const PropertyTable = ({
  property,
  callback,
  isDetail,
}: {
  property: TablePropsInterface;
  callback: Dispatch<SetStateAction<any>>;
  isDetail?: boolean;
}) => {
  const [page, setPage] = useState(1);
  const PAGE_SIZES = [10, 20, 30, 50, 100];
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [initialRecords, setInitialRecords] = useState(
    sortBy(property.requests, "firstName")
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
    if (search === "")
      setInitialRecords(sortBy(property.requests, "firstName"));
    else
      setInitialRecords(() =>
        property.requests.filter(
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
            {property.propertyName}
            {property?.propertyName?.slice(-1) === "s" ? "`" : "`s"} Information
            Requests
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
                title: "First Name",
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
                title: "Last Name",
                sortable: true,
              },
              {
                accessor: "email",
                title: "Email",
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
                    {isDetail ? (
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
                    ) : (
                      <Tippy content="Edit">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 cursor-pointer"
                          onClick={() => callback(requestId)}
                        >
                          <path
                            d="M15.2869 3.15178L14.3601 4.07866L5.83882 12.5999L5.83881 12.5999C5.26166 13.1771 4.97308 13.4656 4.7249 13.7838C4.43213 14.1592 4.18114 14.5653 3.97634 14.995C3.80273 15.3593 3.67368 15.7465 3.41556 16.5208L2.32181 19.8021L2.05445 20.6042C1.92743 20.9852 2.0266 21.4053 2.31063 21.6894C2.59466 21.9734 3.01478 22.0726 3.39584 21.9456L4.19792 21.6782L7.47918 20.5844L7.47919 20.5844C8.25353 20.3263 8.6407 20.1973 9.00498 20.0237C9.43469 19.8189 9.84082 19.5679 10.2162 19.2751C10.5344 19.0269 10.8229 18.7383 11.4001 18.1612L11.4001 18.1612L19.9213 9.63993L20.8482 8.71306C22.3839 7.17735 22.3839 4.68748 20.8482 3.15178C19.3125 1.61607 16.8226 1.61607 15.2869 3.15178Z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                          <path
                            opacity="0.5"
                            d="M14.36 4.07812C14.36 4.07812 14.4759 6.04774 16.2138 7.78564C17.9517 9.52354 19.9213 9.6394 19.9213 9.6394M4.19789 21.6777L2.32178 19.8015"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                        </svg>
                      </Tippy>
                    )}

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

export default PropertyTable;
