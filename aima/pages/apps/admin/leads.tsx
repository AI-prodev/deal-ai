import {
  useDeleteLeadMutation,
  useListLeadsQuery,
  useReportLeadMutation,
} from "@/store/features/leadsApi";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { useSession } from "next-auth/react";
import { useState } from "react";

import { showSuccessToast } from "@/utils/toast";
import Dropdown from "@/components/Dropdown";
import { SquareDoubleAltArrowUp } from "@/components/icons/SVGData";
import withAuth from "@/helpers/withAuth";
import { ADMIN_ROLES } from "@/utils/roles";
import { timeAgo } from "@/utils/timeAgo";
import Head from "next/head";

const LeadsDashborad = () => {
  const { status, data: session } = useSession();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "createdAt",
    direction: "desc",
  });
  const [search, setSearch] = useState("");

  const filters = search
    ? {
        "or:businessName": `regex:${search.trim()}`,
        "or:businessEmail": `regex:${search.trim()}`,
        "or:businessDescription": `regex:${search.trim()}`,
        "or:location": `regex:${search.trim()}`,
      }
    : {};
  const {
    data: leads,
    isLoading,
    isFetching,
    refetch: refetchLeads,
  } = useListLeadsQuery({
    page: page,
    limit: pageSize,
    sort:
      sortStatus.direction === "desc"
        ? `-${sortStatus.columnAccessor}`
        : sortStatus.columnAccessor,
    filters,
  });
  const [deleteLead, { isLoading: isDeleting }] = useDeleteLeadMutation();
  const [reportLead, { isLoading: isReportLoading, isSuccess, isError }] =
    useReportLeadMutation();

  const handleDeleteLead = async (id: string) => {
    try {
      const data = await deleteLead(id);

      if (data) {
        showSuccessToast({ title: "Lead deleted successfully" });
        refetchLeads();
      }
    } catch (error) {
      console.error(`error: ${error}`);
    }
  };

  const handleReport = async (reportData: { leadsId: string }) => {
    try {
      const data = await reportLead(reportData).unwrap();
      if (data && data.message) {
        showSuccessToast({ title: data.message });
      }
    } catch (error) {
      // Handle error
      console.error("Error reporting lead:", error);
    }
  };

  const isAdmin =
    session &&
    session.user &&
    session.user.roles &&
    session.user.roles.includes("admin");
  const columns = [
    {
      accessor: "action",
      title: "",
      render: (lead: any) => (
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
              {isAdmin && (
                <li>
                  <button
                    type="button"
                    onClick={() => handleDeleteLead(lead._id)}
                  >
                    Delete
                  </button>
                </li>
              )}
              <li>
                <button
                  type="button"
                  onClick={() =>
                    handleReport({
                      leadsId: lead._id,
                    })
                  }
                >
                  Report
                </button>
              </li>
            </ul>
          </Dropdown>
        </div>
      ),
    },
    {
      accessor: "businessName",
      title: "Business Name",
      sortable: true,
      render: (lead: any) => (
        <>
          {lead.businessName === "<|UPGRADE|>" ? (
            <a
              className="block flex items-center justify-center rounded bg-primary py-1 px-3 text-sm font-bold text-white hover:bg-blue-700"
              href="https://deal.ai/leadsforagencies"
            >
              <div className="flex items-center justify-center">
                <SquareDoubleAltArrowUp /> <span className="pl-2">Upgrade</span>
              </div>
            </a>
          ) : (
            <a
              className="text-blue-600 underline"
              href={lead.businessWebsite}
              target="_blank"
              rel="noreferrer noopener nofollow"
            >
              {lead.businessName}
            </a>
          )}
        </>
      ),
    },
    {
      accessor: "businessDescription",
      title: "Description",
    },
    {
      accessor: "monthlyMarketingBudget",
      title: "Monthly Marketing Budget",
      sortable: true,
    },
    {
      accessor: "location",
      title: "Location",
      sortable: true,
      render: (lead: any) => (
        <span className=" font-customEmoji">
          {lead?.location?.replace(/[\u{1F1E6}-\u{1F1FF}]/gu, "")}
        </span>
      ),
    },
    {
      accessor: "workingWithAgency",
      title: "Working With Agency",
      sortable: true,
    },
    {
      accessor: "currentChallenges",
      title: "Current Challenges",
      sortable: true,
    },
    {
      accessor: "businessEmail",
      title: "Business Email",
      sortable: true,

      render: (lead: any) => (
        <>
          {lead.businessEmail === "<|UPGRADE|>" ? (
            <a
              className="block flex items-center justify-center rounded bg-primary py-1 px-3 text-sm font-bold text-white hover:bg-blue-700"
              href="https://deal.ai/leadsforagencies"
            >
              <div className="flex items-center justify-center">
                <SquareDoubleAltArrowUp /> <span className="pl-2">Upgrade</span>
              </div>
            </a>
          ) : (
            <a
              className="text-blue-600 underline"
              href={`mailto:${lead.businessEmail}`}
            >
              {lead.businessEmail}
            </a>
          )}
        </>
      ),
    },
    {
      accessor: "createdAt",
      title: "Added",
      sortable: true,
      render: (lead: any) => (
        <span className="text-gray-500">{timeAgo(lead.createdAt)}</span>
      ),
    },
  ];

  //sorting and pagination

  const handlePageChange = (p: number) => {
    setPage(p);
    refetchLeads();
  };

  const handleRecordsPerPageChange = (size: number) => {
    setPageSize(size);
    setPage(1);

    refetchLeads();
  };

  const handleSortStatusChange = (status: DataTableSortStatus) => {
    setSortStatus(status);
    refetchLeads();
  };

  return (
    <>
      <Head>
        <title>Admin Panel - AI Marketing Lead Flow</title>
      </Head>

      <div className="panel">
        <div className="mb-5 flex items-center rounded bg-primary p-3.5 text-white">
          <span className="ltr:pr-2 rtl:pl-2">
            Businesses that have requested help from our AI Marketing Agency
            Network. Contact them directly to work out a deal.{" "}
            <strong className="ltr:mr-1 rtl:ml-1">Note:</strong> Deal.AI does
            not vet these leads.
          </span>
        </div>
        <div className="mb-4.5 flex flex-col gap-5 md:flex-row md:items-center">
          <div className=" w-full ltr:ml-auto rtl:mr-auto md:w-1/4">
            <input
              type="text"
              className="form-input w-full"
              placeholder="Search"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="datatables overflow-x-auto ">
          <>
            <DataTable
              highlightOnHover
              fetching={isFetching}
              records={leads?.results}
              columns={columns}
              totalRecords={leads?.totalData || 0}
              recordsPerPage={pageSize}
              page={page}
              minHeight={750}
              loaderVariant="dots"
              loaderSize="md"
              loaderColor="#1b2e4b"
              loaderBackgroundBlur={0}
              onPageChange={handlePageChange}
              onRecordsPerPageChange={handleRecordsPerPageChange}
              recordsPerPageOptions={[10, 20, 50, 100]}
              sortStatus={sortStatus}
              onSortStatusChange={handleSortStatusChange}
              idAccessor="_id"
              paginationText={({ from, to, totalRecords }: any) =>
                `Showing  ${from} to ${to} of ${totalRecords} entries`
              }
              scrollAreaProps={{ type: "always" }}
            />
          </>
        </div>
      </div>
    </>
  );
};

export default withAuth(LeadsDashborad, ADMIN_ROLES);
