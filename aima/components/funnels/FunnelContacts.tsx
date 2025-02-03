import React, { useState, useEffect } from "react";
import Dropdown from "@/components/Dropdown";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import "flatpickr/dist/flatpickr.css";
import { createContactApi } from "@/store/features/contactApi";
import { IContact } from "@/interfaces/IContact";
import { IFunnel } from "@/interfaces/IFunnel";
import clsx from "clsx";
import { paginationMessage } from "@/utils/paginationMessage";
import { RECORDS_PER_PAGE_OPTIONS } from "@/components/crm/constants";
import Error from "@/components/crm/Error";
import LoadingAnimation from "@/components/LoadingAnimation";

const FunelContacts = ({
  funnel,
  isLightMode = false,
}: {
  funnel: IFunnel;
  isLightMode?: boolean;
}) => {
  const [search, setSearch] = useState("");
  const [downloadCSV, setDownloadCSV] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "_id",
    direction: "asc",
  });

  const filters = search
    ? {
        "or:email": `regex:${search.trim()}`,
        "or:firstName": `regex:${search.trim()}`,
        "or:lastName": `regex:${search.trim()}`,
      }
    : {};

  const {
    data: users,
    error,
    isLoading,
    isFetching,
    refetch: refetchContacts,
  } = createContactApi.useListFunnelContactsQuery({
    funnelId: funnel._id,
    page,
    limit: pageSize,
    sort:
      sortStatus.direction === "desc"
        ? `-${sortStatus.columnAccessor}`
        : sortStatus.columnAccessor,
    filters,
  });
  const [deleteContact] = createContactApi.useDeleteContactMutation();

  const handleDeleteContact = async (contactId: string) => {
    try {
      if (!confirm("Are you sure?")) {
        return;
      }
      await deleteContact({ contactId });
      refetchContacts();
    } catch (error) {
      console.error(`error: ${error}`);
    }
  };

  const { data: csvData, refetch } =
    createContactApi.useDownloadFunnelContactsCSVQuery(
      { funnelId: funnel._id },
      {
        skip: !downloadCSV, // Skip the initial query, we'll use refetch on click
      }
    );

  function downloadBlob(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = filename;

    document.body.appendChild(a);
    a.click();

    window.URL.revokeObjectURL(url);
  }

  const handleDownload = () => {
    setDownloadCSV(true);
  };

  // Once the data is available, trigger the download
  useEffect(() => {
    if (csvData) {
      const blob = new Blob([csvData], { type: "text/csv" });
      downloadBlob(blob, "contacts.csv");
      setDownloadCSV(false);
    }
  }, [csvData]);

  //sorting and pagination
  const handlePageChange = (p: number) => {
    setPage(p);
    refetchContacts();
  };

  const handleRecordsPerPageChange = (size: number) => {
    setPageSize(size);
    setPage(1);

    refetchContacts();
  };

  const handleSortStatusChange = (status: DataTableSortStatus) => {
    setSortStatus(status);
    refetchContacts();
  };
  const columns = [
    {
      accessor: "action",
      title: "Action",
      render: (user: IContact) => (
        <div
          className={clsx("", {
            "dropdown-light": isLightMode,
            dropdown: !isLightMode,
          })}
        >
          <Dropdown
            offset={[0, 5]}
            placement={"bottom-start"}
            button={
              <svg
                className="m-auto h-5 w-5 opacity-70"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="5"
                  cy="12"
                  r="2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <circle
                  opacity="0.5"
                  cx="12"
                  cy="12"
                  r="2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <circle
                  cx="19"
                  cy="12"
                  r="2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            }
          >
            <ul>
              <li>
                <button
                  type="button"
                  onClick={() => handleDeleteContact(user._id)}
                >
                  Delete
                </button>
              </li>
            </ul>
          </Dropdown>
        </div>
      ),
    },
    {
      accessor: "firstName",
      title: "Name",
      sortable: true,
      render: (user: IContact) => `${user.firstName} ${user.lastName}`,
    },
    {
      accessor: "email",
      title: "Email",
      sortable: true,
      render: (user: IContact) => user.email,
    },
    {
      accessor: "createdAt",
      title: "Created",
      sortable: true,
      render: (user: IContact) =>
        user.createdAt ? new Date(user.createdAt).toLocaleString() : "N/A",
    },
  ];

  if (isLoading) {
    return (
      <div className="mt-4">
        <LoadingAnimation className="max-w-[9rem] !block mx-auto" />
      </div>
    );
  }

  if (error) {
    // prettier-ignore
    //@ts-ignore
    return <div className="m-4"><Error message={error?.data?.error || "Something went wrong, please try again"} /></div>;
  }

  return (
    <div className="custom-select space-y-8 overflow-auto pt-5">
      <div
        className={clsx("", {
          "panel-light": isLightMode,
          panel: !isLightMode,
        })}
      >
        <div className="mb-4.5 flex flex-col gap-5 md:flex-row md:items-center">
          <div className="flex flex-wrap items-center">
            <button
              type="button"
              onClick={handleDownload}
              className="btn btn-primary btn-sm m-1 "
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ltr:mr-2 rtl:ml-2"
              >
                <path
                  d="M15.3929 4.05365L14.8912 4.61112L15.3929 4.05365ZM19.3517 7.61654L18.85 8.17402L19.3517 7.61654ZM21.654 10.1541L20.9689 10.4592V10.4592L21.654 10.1541ZM3.17157 20.8284L3.7019 20.2981H3.7019L3.17157 20.8284ZM20.8284 20.8284L20.2981 20.2981L20.2981 20.2981L20.8284 20.8284ZM14 21.25H10V22.75H14V21.25ZM2.75 14V10H1.25V14H2.75ZM21.25 13.5629V14H22.75V13.5629H21.25ZM14.8912 4.61112L18.85 8.17402L19.8534 7.05907L15.8947 3.49618L14.8912 4.61112ZM22.75 13.5629C22.75 11.8745 22.7651 10.8055 22.3391 9.84897L20.9689 10.4592C21.2349 11.0565 21.25 11.742 21.25 13.5629H22.75ZM18.85 8.17402C20.2034 9.3921 20.7029 9.86199 20.9689 10.4592L22.3391 9.84897C21.9131 8.89241 21.1084 8.18853 19.8534 7.05907L18.85 8.17402ZM10.0298 2.75C11.6116 2.75 12.2085 2.76158 12.7405 2.96573L13.2779 1.5653C12.4261 1.23842 11.498 1.25 10.0298 1.25V2.75ZM15.8947 3.49618C14.8087 2.51878 14.1297 1.89214 13.2779 1.5653L12.7405 2.96573C13.2727 3.16993 13.7215 3.55836 14.8912 4.61112L15.8947 3.49618ZM10 21.25C8.09318 21.25 6.73851 21.2484 5.71085 21.1102C4.70476 20.975 4.12511 20.7213 3.7019 20.2981L2.64124 21.3588C3.38961 22.1071 4.33855 22.4392 5.51098 22.5969C6.66182 22.7516 8.13558 22.75 10 22.75V21.25ZM1.25 14C1.25 15.8644 1.24841 17.3382 1.40313 18.489C1.56076 19.6614 1.89288 20.6104 2.64124 21.3588L3.7019 20.2981C3.27869 19.8749 3.02502 19.2952 2.88976 18.2892C2.75159 17.2615 2.75 15.9068 2.75 14H1.25ZM14 22.75C15.8644 22.75 17.3382 22.7516 18.489 22.5969C19.6614 22.4392 20.6104 22.1071 21.3588 21.3588L20.2981 20.2981C19.8749 20.7213 19.2952 20.975 18.2892 21.1102C17.2615 21.2484 15.9068 21.25 14 21.25V22.75ZM21.25 14C21.25 15.9068 21.2484 17.2615 21.1102 18.2892C20.975 19.2952 20.7213 19.8749 20.2981 20.2981L21.3588 21.3588C22.1071 20.6104 22.4392 19.6614 22.5969 18.489C22.7516 17.3382 22.75 15.8644 22.75 14H21.25ZM2.75 10C2.75 8.09318 2.75159 6.73851 2.88976 5.71085C3.02502 4.70476 3.27869 4.12511 3.7019 3.7019L2.64124 2.64124C1.89288 3.38961 1.56076 4.33855 1.40313 5.51098C1.24841 6.66182 1.25 8.13558 1.25 10H2.75ZM10.0298 1.25C8.15538 1.25 6.67442 1.24842 5.51887 1.40307C4.34232 1.56054 3.39019 1.8923 2.64124 2.64124L3.7019 3.7019C4.12453 3.27928 4.70596 3.02525 5.71785 2.88982C6.75075 2.75158 8.11311 2.75 10.0298 2.75V1.25Z"
                  fill="currentColor"
                />
                <path
                  opacity="0.5"
                  d="M13 2.5V5C13 7.35702 13 8.53553 13.7322 9.26777C14.4645 10 15.643 10 18 10H22"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
              Download CSV
            </button>
          </div>
          <div className=" w-full ltr:ml-auto rtl:mr-auto md:w-1/4">
            <input
              type="text"
              className={clsx("form-input w-full", {
                "!bg-white !text-[#333333]": isLightMode,
              })}
              placeholder="Search by first name, last name, or email"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div
          className={clsx("", {
            "datatables-light": isLightMode,
            datatables: !isLightMode,
          })}
        >
          <div className="table-responsive mb-5 ">
            <DataTable
              highlightOnHover
              fetching={isFetching}
              records={users?.results || []}
              columns={columns}
              totalRecords={users?.totalData || 0}
              recordsPerPage={pageSize}
              page={page}
              minHeight={200}
              height={600}
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
        </div>
      </div>
    </div>
  );
};

export default FunelContacts;
