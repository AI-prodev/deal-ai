import React, { ChangeEvent, useState } from "react";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { useContactPurchasesQuery } from "@/store/features/contactApi";
import { useRouter } from "next/router";
import { ISales } from "@/interfaces/ISales";
import Currency from "@/components/Currency";
import CRMHeader from "@/components/crm/CRMHeader";
import LoadingAnimation from "@/components/LoadingAnimation";
import Error from "@/components/crm/Error";
import { paginationMessage } from "@/utils/paginationMessage";
import { RECORDS_PER_PAGE_OPTIONS } from "@/components/crm/constants";

export const ContactPurchases = () => {
  const { query } = useRouter();
  const contactId = query?.id as string;
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "createdAt",
    direction: "desc",
  });

  const filters = search
    ? {
        "or:product": `regex:${search.trim()}`,
        "or:customer": `regex:${search.trim()}`,
      }
    : {};

  const {
    data: contactPurchases,
    error,
    isLoading,
    isFetching,
    refetch: refetchContactPurchases,
  } = useContactPurchasesQuery(
    {
      contactId,
      page,
      limit: pageSize,
      sort:
        sortStatus.direction === "desc"
          ? `-${sortStatus.columnAccessor}`
          : sortStatus.columnAccessor,
      filters,
    },
    { skip: !contactId }
  );

  const handlePageChange = (p: number): void => {
    setPage(p);
    refetchContactPurchases();
  };

  const handleRecordsPerPageChange = (size: number): void => {
    setPageSize(size);
    setPage(1);
    refetchContactPurchases();
  };

  const handleSortStatusChange = (status: DataTableSortStatus): void => {
    setSortStatus(status);
    refetchContactPurchases();
  };

  const handleChangeSearch = (event: ChangeEvent<HTMLInputElement>): void => {
    setSearch(event.target.value);
  };

  const columns = [
    {
      accessor: "product",
      title: "Product",
      sortable: true,
      render: (invoice: ISales) => invoice.product,
    },
    {
      accessor: "amount",
      title: "Amount",
      sortable: true,
      render: (invoice: ISales) => (
        <>
          <Currency value={invoice.amount} currency="usd" />
          {invoice?.interval ? ` / ${invoice.interval}` : ""}
        </>
      ),
    },
    {
      accessor: "customer",
      title: "Customer",
      sortable: true,
      render: (invoice: ISales) => invoice.customer,
    },
    {
      accessor: "status",
      title: "Status",
      sortable: false,
      render: (invoice: ISales) => (
        <span className="badge whitespace-nowrap bg-primary">PAID</span>
      ),
    },
    {
      accessor: "transaction",
      title: "Transaction",
      sortable: false,
      render: (invoice: ISales) => invoice.transaction,
    },
    {
      accessor: "createdAt",
      title: "Created",
      sortable: true,
      render: (invoice: ISales) =>
        invoice.createdAt
          ? new Date(invoice.createdAt).toLocaleString()
          : "N/A",
    },
  ];

  return (
    <div className="max-w-[992px]">
      <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-end mb-5">
        <CRMHeader />
        <div className="w-full sm:w-48 flex flex-col md:flex-row justify-end align-center mt-4.5 sm:mt-0">
          <input
            type="text"
            className="form-input w-full"
            placeholder="Search by product name or customer"
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
                records={contactPurchases?.results || []}
                columns={columns}
                totalRecords={contactPurchases?.totalData || 0}
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

export default ContactPurchases;
