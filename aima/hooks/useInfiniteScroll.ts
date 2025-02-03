import { IGetTicketsListResponse } from "@/interfaces/ITicket";
import { assistApi } from "@/store/features/assistApi";
import { UseQuery } from "@reduxjs/toolkit/dist/query/react/buildHooks";
import { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";

export const isValidNotEmptyArray = (array: any[]): boolean => {
  return !!(array && array?.length && array?.length > 0);
};

const useInfiniteScroll = (
  useGetDataListQuery: UseQuery<any>,
  { ...queryParameters },
  { skip = false }
) => {
  const dispatch = useDispatch();

  const [isFetching, setIsFetching] = useState(true);

  const [localPage, setLocalPage] = useState(1);
  const [combinedData, setCombinedData] = useState<any[]>([]);
  const queryResponse = useGetDataListQuery(
    {
      page: localPage,
      ...queryParameters,
    },
    {
      skip,
    }
  );
  const { results, currentPage, totalPages, next } =
    (queryResponse.data as unknown as IGetTicketsListResponse) || {};

  useEffect(() => {
    if (isValidNotEmptyArray(results)) {
      if (localPage === 1) setCombinedData(results);
      else if (localPage === currentPage) {
        setCombinedData(previousData => {
          const mergedResults = [...previousData];

          results.forEach(newItem => {
            const existingIndex = mergedResults.findIndex(
              item => item._id === newItem._id
            );
            if (existingIndex !== -1) {
              mergedResults[existingIndex] = newItem;
            } else {
              mergedResults.push(newItem);
            }
          });

          return mergedResults;
        });
      }
    } else {
      setCombinedData([]);
    }
  }, [results]);

  useEffect(() => {
    if (
      (!queryResponse?.isFetching &&
        combinedData?.length === results?.length) ||
      skip
    ) {
      setIsFetching(false);
    }
  }, [queryResponse?.isFetching, results?.length, combinedData?.length, skip]);

  const refresh = useCallback(() => {
    setLocalPage(1);
    dispatch(
      assistApi.util.invalidateTags([
        "VisitorTicket",
        "VisitorTickets",
        "Ticket",
        "Tickets",
      ])
    );
  }, []);

  const loadMore = () => {
    if (localPage < totalPages && localPage === currentPage && next.page) {
      setIsFetching(true);
      setLocalPage(next.page);
    } else {
      setIsFetching(false);
    }
  };

  return {
    combinedData,
    setCombinedData,
    localPage,
    loadMore,
    refresh,
    isLoading: queryResponse?.isLoading,
    isFetching,
  };
};

export default useInfiniteScroll;
