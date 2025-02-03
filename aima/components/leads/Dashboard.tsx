import {
  useDeleteLeadMutation,
  useListLeadsQuery,
  useReportLeadMutation,
} from "@/store/features/leadsApi";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import LeadsCard from "./LeadsCard";
import LoadingSkeleton from "../apollo/LoadingSkeleton";
import SortControl from "./SortingControl";
import { DataTableSortStatus } from "mantine-datatable";

const LeadsDashborad = () => {
  const { data: session } = useSession();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [leads, setLeads] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<any>({});
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "createdAt",
    direction: "desc",
  });
  useEffect(() => {
    const filtersData = search
      ? {
          "or:businessName": `regex:${search.trim()}`,
          "or:businessEmail": `regex:${search.trim()}`,
          "or:businessDescription": `regex:${search.trim()}`,
          "or:location": `regex:${search.trim()}`,
        }
      : {};
    setFilters(filtersData);
  }, [search]);

  const {
    data: leadsData,
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

  // const [deleteLead] = useDeleteLeadMutation();
  // const [reportLead] = useReportLeadMutation();

  // const handleDeleteLead = async (id: string) => {
  //   try {
  //     const data = await deleteLead(id);

  //     if (data) {
  //       showSuccessToast({ title: 'Lead deleted successfully' });
  //       refetchLeads();
  //     }
  //   } catch (error) {
  //     console.error(`error: ${error}`);
  //   }
  // };

  // const handleReport = async (reportData: { leadsId: string }) => {
  //   try {
  //     const data = await reportLead(reportData).unwrap();
  //     if (data && data.message) {
  //       showSuccessToast({ title: data.message });
  //     }
  //   } catch (error) {
  //     // Handle error
  //     console.error('Error reporting lead:', error);
  //   }
  // };

  const isAdmin =
    session &&
    session.user &&
    session.user.roles &&
    session.user.roles.includes("admin");

  const loadMoreLeads = useCallback(() => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    setPage(prevPage => prevPage + 1);
  }, [hasMore, loadingMore, page]);

  useEffect(() => {
    if (
      leadsData &&
      leadsData.results.length > 0 &&
      leadsData.currentPage > 1
    ) {
      //@ts-ignore
      setLeads(prevLeads => [...prevLeads, ...leadsData.results]);
      setHasMore(leadsData.currentPage < leadsData.totalPages);
    } else if (
      leadsData &&
      leadsData.results.length > 0 &&
      leadsData.currentPage === 1
    ) {
      setLeads(leadsData.results);
      setHasMore(leadsData.currentPage < leadsData.totalPages);
    }

    setLoadingMore(false);
  }, [leadsData]);

  const debounce = <F extends (...args: any[]) => any>(
    func: F,
    delay: number
  ): ((...args: Parameters<F>) => void) => {
    let inDebounce: NodeJS.Timeout | undefined;

    return function (this: ThisParameterType<F>, ...args: Parameters<F>) {
      clearTimeout(inDebounce);
      inDebounce = setTimeout(() => func.apply(this, args), delay);
    };
  };

  const handleScroll = useCallback(() => {
    const scrollPosition =
      window.innerHeight + document.documentElement.scrollTop;
    const threshold = document.documentElement.offsetHeight - 100;

    if (scrollPosition >= threshold && !loadingMore) {
      loadMoreLeads();
    }
  }, [loadMoreLeads, loadingMore]);

  const debouncedHandleScroll = debounce(handleScroll, 100);

  useEffect(() => {
    window.addEventListener("scroll", debouncedHandleScroll);
    return () => window.removeEventListener("scroll", debouncedHandleScroll);
  }, [debouncedHandleScroll]);

  useEffect(() => {
    if (!isLoading) {
      setLoadingMore(false);
    }
    if (isLoading) {
      setLoadingMore(true);
    }
  }, [isLoading]);

  const debouncedSearch = useCallback(
    debounce(newSearch => {
      setIsSearching(true);
      setSearch(newSearch);
      setPage(1);
      setLeads([]);
    }, 1000),
    [isFetching, isLoading]
  );

  useEffect(() => {
    if (!isLoading && !isFetching) {
      setIsSearching(false);
    }
  }, [isFetching, isLoading]);

  const handleSearchChange = (event: any) => {
    setIsSearching(true);
    const newSearch = event.target.value;
    debouncedSearch(newSearch);
  };
  const setSort = (criteria: any) => {
    setIsSearching(true);

    setSortStatus({
      columnAccessor: criteria,
      direction: sortStatus.direction === "asc" ? "desc" : "asc",
    });

    setPage(1);
    setPageSize(leads.length);
    setLeads([]);
    refetchLeads();
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setPage(1);
      setPageSize(pageSize * page);
      refetchLeads();
    }, 60000);

    return () => clearInterval(interval);
  }, [pageSize, filters, sortStatus, refetchLeads]);

  return (
    <div className="panel">
      <div className="mb-5 flex items-center rounded bg-primary p-3.5 text-white">
        <span className="ltr:pr-2 rtl:pl-2">
          The following is a list of businesses that have requested proposals
          from our AI Marketing Agency network to implement deal.ai in their
          businesses to grow sales and revenue. Please review this list, craft a
          proposal and contact the business owner directly to work out a deal.{" "}
          <strong className="ltr:mr-1 rtl:ml-1">Note:</strong> Deal.ai does not
          vet these leads. Also, while you can mention that you saw the
          opportunity on the deal.ai marketplace, you cannot in any shape or
          form represent that you are part of the deal.ai team, or a partner or
          an approved vendor of deal.ai.
        </span>
      </div>
      <div className="mb-1 mx-auto flex flex-col gap-5 md:w-1/2 md:flex-row md:items-center">
        <div className=" w-full ">
          <input
            type="text"
            className="form-input w-full"
            placeholder="🔎 Search"
            onChange={handleSearchChange}
          />
        </div>
        <div>
          <SortControl setSort={setSort} sortStatus={sortStatus} />
        </div>
      </div>

      <div className="datatables overflow-x-auto ">
        {leads.map((item, index) => (
          <div key={index} className="my-4 mx-auto py-2 md:w-1/2">
            <LeadsCard
              lead={item}
              refetchLeads={refetchLeads}
              isAdmin={isAdmin ? isAdmin : false}
            />
          </div>
        ))}
        {isSearching && (
          <div className="my-5 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
            <p className="ml-3 text-lg text-blue-500">Loading...</p>
          </div>
        )}
        {loadingMore && (
          <div className="w-1/2">
            <LoadingSkeleton />
          </div>
        )}
        {!isSearching && !leads.length && !isLoading && !isFetching && (
          <p className="my-8 text-center text-lg font-semibold text-gray-500">
            We couldn't find any leads matching your search
          </p>
        )}
        {!loadingMore && !hasMore && leads.length > 0 && (
          <p className="my-8 text-center text-lg font-semibold text-gray-500">
            That's all the leads for now, come back later for more!
          </p>
        )}
      </div>
    </div>
  );
};

export default LeadsDashborad;
