import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { useState, useRef, useEffect } from "react";

import Modal from "../Modal";

import Dropdown from "../Dropdown";

import { truncate } from "lodash";
import { showSuccessToast } from "@/utils/toast";
import {
  useDeletePropertySellerMutation,
  useGetAllPropertySellersQuery,
  useUpdatePropertySellerMutation,
} from "@/store/features/propertySellerApi";
import { ICommercialSeller } from "@/interfaces/ICommercialSeller";
import PropertySellForm from "./PropertySellForm";
import { useSession } from "next-auth/react";

const ListSellProperties = () => {
  const { status, data: session } = useSession();

  const [
    deletePropertySeller,
    { isLoading: isDeleting, status: deleteStatus },
  ] = useDeletePropertySellerMutation();
  const [isEditModalOpen, setEditIsModalOpen] = useState(false);
  const [selectedEditProperty, setSelectedEditProperty] = useState<string>();
  const [selectedDetailProperty, setSelectedDetailProperty] =
    useState<string>();
  const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleteBusinessTitle, setDeleteBusinessTitle] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "_id",
    direction: "asc",
  });
  const [search, setSearch] = useState("");
  const filters = search
    ? {
        "or:propertyName": `regex:${search.trim()}`,
        "or:propertyType": `regex:${search.trim()}`,
        "or:country": `regex:${search.trim()}`,
      }
    : {};
  const {
    data: propertyData,
    error,
    isLoading,
    refetch,
    isFetching,
  } = useGetAllPropertySellersQuery({
    page,
    limit: pageSize,
    sort:
      sortStatus.direction === "desc"
        ? `-${sortStatus.columnAccessor}`
        : sortStatus.columnAccessor,
    filters: { ...filters },
  });

  const dropdownRef = useRef(null);

  const handleEditClick = (id?: string) => {
    setSelectedEditProperty(id);
    setEditIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditIsModalOpen(false);
  };

  const handleAddCloseModal = () => {
    setAddModalOpen(false);
  };
  const handleDeleteClick = async (id?: string, title?: string) => {
    setIsDeleteConfirmOpen(true);
    if (id && title) {
      setDeleteBusinessTitle(title);
      await deletePropertySeller(id);
      refetch();
    }
  };
  useEffect(() => {
    if (deleteStatus === "fulfilled") {
      showSuccessToast({
        title: `Deleted Business ${deleteBusinessTitle}`,
      });
    }
  }, [deleteStatus]);

  const handleDeleteConfirm = () => {
    // Handle delete logic here
    setIsDeleteConfirmOpen(false);
  };

  const handleDeleteCancel = () => {
    setIsDeleteConfirmOpen(false);
  };
  const lastRowRef = useRef<HTMLTableRowElement | null>(null);

  useEffect(() => {
    const tableRows = document.querySelectorAll(".mantine-table-row");

    if (tableRows.length > 0) {
      lastRowRef.current = tableRows[
        tableRows.length - 1
      ] as HTMLTableRowElement;
      lastRowRef.current.classList.add("last-row");
    }

    return () => {
      if (lastRowRef.current) {
        lastRowRef.current.classList.remove("last-row");
      }
    };
  }, [propertyData]);

  const handleDetail = (id?: string) => {
    if (id) {
      setSelectedDetailProperty(id);
      setEditIsModalOpen(true);
    }
  };

  const handleAddProperty = () => {
    setAddModalOpen(true);
  };

  //sorting and pagination

  const handlePageChange = (p: number) => {
    setPage(p);
    refetch();
  };

  const handleRecordsPerPageChange = (size: number) => {
    setPageSize(size);
    setPage(1);
    refetch();
  };

  const handleSortStatusChange = (status: DataTableSortStatus) => {
    setSortStatus(status);
    refetch();
  };

  const columns = [
    { accessor: "propertyName", title: "Property Name", sortable: true },
    {
      accessor: "propertyDescription",
      title: "Property Description",
      sortable: false,
      render: (record: ICommercialSeller) => (
        <div className=" max-w-5xl  whitespace-pre-wrap text-justify shadow-none">
          {record.propertyDescription}
        </div>
      ),
    },
    { accessor: "propertyType", title: "Property Type", sortable: true },
    { accessor: "listingPrice", title: "Listing Price", sortable: true },
    { accessor: "country", title: "Country", sortable: true },
    {
      accessor: "actions",
      title: "Actions",
      render: (record: ICommercialSeller) => (
        <div ref={dropdownRef} onClick={e => e.stopPropagation()}>
          <div className="dropdown">
            <Dropdown
              offset={[0, 5]}
              placement={"bottom-end"}
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
                    onClick={() =>
                      handleDeleteClick(record._id, record.propertyName)
                    }
                  >
                    Delete
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleEditClick(record._id)}
                  >
                    Edit
                  </button>
                </li>
              </ul>
            </Dropdown>
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      {addModalOpen && (
        <>
          <PropertySellForm
            mode="create"
            isOpen={addModalOpen}
            onRequestClose={handleAddCloseModal}
            onRefetch={refetch}
          />
        </>
      )}
      {selectedEditProperty && (
        <>
          <PropertySellForm
            mode="edit"
            isOpen={isEditModalOpen}
            onRequestClose={handleCloseModal}
            selectedPropertySeller={{ id: selectedEditProperty }}
            onRefetch={refetch}
          />
        </>
      )}
      {selectedDetailProperty && (
        <>
          <PropertySellForm
            mode="show"
            isOpen={isEditModalOpen}
            onRequestClose={handleCloseModal}
            selectedPropertySeller={{ id: selectedDetailProperty }}
            onRefetch={refetch}
          />
        </>
      )}
      {session &&
        session.user &&
        session.user.roles &&
        (session.user.roles.includes("seller") ||
          session.user.roles.includes("admin")) && (
          <div className="mb-3 flex justify-end">
            <button
              onClick={handleAddProperty}
              className="rounded bg-primary px-4 py-2 text-white"
            >
              Add Property
            </button>
          </div>
        )}
      <div className="panel">
        <div className="datatables">
          {isLoading ? (
            <p>Loading...</p>
          ) : error ? (
            <p>Error: </p>
          ) : (
            <>
              {" "}
              <div className="mb-4.5 flex flex-col gap-5 md:flex-row md:items-center">
                <div className="w-full ltr:ml-auto rtl:mr-auto md:w-1/4">
                  <input
                    type="text"
                    className="form-input w-full"
                    placeholder="Search by property name , type or country"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
              </div>
              {propertyData?.results && propertyData.results.length > 0 ? (
                <div className="table-responsive  mb-5 h-screen min-h-screen">
                  <DataTable
                    fetching={isFetching}
                    records={propertyData.results}
                    columns={columns}
                    highlightOnHover
                    idAccessor="_id"
                    onRowClick={(record, recordIndex) =>
                      handleDetail(record._id)
                    }
                    totalRecords={propertyData?.totalData || 0}
                    recordsPerPage={pageSize}
                    page={page}
                    loaderVariant="dots"
                    loaderSize="md"
                    loaderColor="#1b2e4b"
                    loaderBackgroundBlur={0}
                    onPageChange={handlePageChange}
                    recordsPerPageOptions={[5, 10, 20, 50]}
                    onRecordsPerPageChange={handleRecordsPerPageChange}
                    sortStatus={sortStatus}
                    onSortStatusChange={handleSortStatusChange}
                    paginationText={({ from, to, totalRecords }: any) =>
                      `Showing  ${from} to ${to} of ${totalRecords} entries`
                    }
                  />
                </div>
              ) : (
                <h1>List your first property for sale!</h1>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ListSellProperties;
