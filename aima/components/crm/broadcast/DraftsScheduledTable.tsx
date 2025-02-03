"use client";

import React, { ChangeEvent, FC, useState } from "react";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import {
  useDeleteEmailMutation,
  useGetEmailsQuery,
} from "@/store/features/broadcastApi";
import type { Email } from "@/interfaces/IBroadcast";
import Swal from "sweetalert2";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import Dropdown from "@/components/Dropdown";
import { DotsSVG } from "@/components/icons/SVGData";
import {
  RECORDS_PER_PAGE_OPTIONS,
  SendEmailStatus,
} from "@/components/crm/constants";
import Link from "next/link";
import LoadingAnimation from "@/components/LoadingAnimation";
import Error from "@/components/crm/Error";
import { paginationMessage } from "@/utils/paginationMessage";

interface IDraftsScheduledTableProps {
  status: SendEmailStatus.draft | SendEmailStatus.scheduled;
}

const DraftsScheduledTable: FC<IDraftsScheduledTableProps> = ({ status }) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "createdAt",
    direction: "desc",
  });

  const [deleteEmail] = useDeleteEmailMutation();

  const {
    data: emails,
    error,
    isLoading,
    isFetching,
  } = useGetEmailsQuery({
    status,
    page,
    limit: pageSize,
    sort:
      sortStatus.direction === "desc"
        ? `-${sortStatus.columnAccessor}`
        : sortStatus.columnAccessor,
    search,
  });

  const handleDeleteRow = async (emailId: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Are you sure you want to remove ${status}?`,
      icon: "warning",
      reverseButtons: true,
      showCancelButton: true,
      showCloseButton: true,
      confirmButtonColor: "#4361ee",
      confirmButtonText: "Yes",
    }).then(async result => {
      if (result.isConfirmed) {
        await deleteEmail(emailId)
          .then((res: any) => {
            if (res.error) {
              showErrorToast(
                res.error?.data?.error || `Failed to remove ${status}`
              );
              return;
            }

            showSuccessToast({
              title: `${status.charAt(0).toUpperCase() + status.slice(1)} removed successfully`,
            });
          })
          .catch(() => {
            showErrorToast(`Failed to remove ${status}`);
          });
      }
    });
  };

  const columns = [
    {
      accessor: "title",
      title: "Title",
      sortable: true,
      render: (email: Email) => email.title,
    },
    {
      accessor: "subject",
      title: "Subject",
      sortable: true,
      render: (email: Email) => email.subject,
    },
    {
      accessor: "createdAt",
      title: "Created",
      sortable: true,
      render: (email: Email) =>
        email.createdAt ? new Date(email.createdAt).toLocaleString() : "N/A",
    },
    {
      accessor: "action",
      title: "",
      sortable: false,
      render: (email: Email) => (
        <div className="dropdown flex justify-end">
          <Dropdown
            offset={[0, 5]}
            placement="bottom-end"
            button={<DotsSVG className="m-auto h-5 w-5 opacity-70" />}
          >
            <ul>
              {status === SendEmailStatus.draft && (
                <li>
                  <Link href={`/crm/broadcast/create/${email?._id}`}>
                    Continue
                  </Link>
                </li>
              )}
              <li>
                <button
                  type="button"
                  onClick={() => {
                    handleDeleteRow(email?._id);
                  }}
                >
                  Delete
                </button>
              </li>
            </ul>
          </Dropdown>
        </div>
      ),
    },
  ];

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
    <div>
      <div className="datatables datatables-fields-bg">
        {isLoading ? (
          <LoadingAnimation className="max-w-[9rem] !block mx-auto" />
        ) : // prettier-ignore
        //@ts-ignore
        error ? <Error message={error?.data?.error || "Something went wrong, please try again"} />
            : (
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
                fetching={isFetching}
                records={emails?.results || []}
                columns={columns}
                totalRecords={emails?.totalCount || 0}
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

export default DraftsScheduledTable;
