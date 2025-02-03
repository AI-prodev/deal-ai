import { useSocketContext } from "@/contexts/SocketConnection";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import { ITicket, TicketStatusEnum } from "@/interfaces/ITicket";
import LoadingSpinner from "@/pages/components/loadingSpinner";
import { useGetTicketsQuery } from "@/store/features/assistApi";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import PerfectScrollbar from "react-perfect-scrollbar";
import TicketCard from "./ticketCard";
import Dropdown from "@/components/Dropdown";
import { ArrowDownSVG, CheckmarkSVG } from "../../icons/SVGData";
import clsx from "clsx";

interface TicketsProps {
  selectedTicket: Omit<ITicket, "messages"> | null;
  drawerOpen: boolean;
  assistKey?: string;
  setSelectedTicket: React.Dispatch<
    React.SetStateAction<Omit<ITicket, "messages"> | null>
  >;
  toggleCodeSnippetModal: VoidFunction;
  toggleDrawer: VoidFunction;
}

const Tickets = ({
  selectedTicket,
  drawerOpen,
  assistKey,
  setSelectedTicket,
  toggleCodeSnippetModal,
  toggleDrawer,
}: TicketsProps) => {
  const socket = useSocketContext();
  const { data: session } = useSession();

  const { inView, ref } = useInView();

  const [status, setStatus] = useState<TicketStatusEnum | string>(
    TicketStatusEnum.OPEN
  );
  const [typingVisitors, setTypingVisitors] = useState<
    {
      chatId: string;
      sender: string;
    }[]
  >([]);

  const [onlineVisitors, setOnlineVisitors] = useState<string[]>([]);

  const {
    combinedData: tickets,
    isLoading,
    isFetching,
    refresh,
    loadMore,
  } = useInfiniteScroll(
    useGetTicketsQuery,
    { status: status === "All" ? "" : status },
    {}
  );

  useEffect(() => {
    if (!socket) return;

    socket.on(
      "onlineVisitors",
      ({ data, widgetId }: { data: string[]; widgetId: string }) => {
        if (widgetId === assistKey) setOnlineVisitors(data);
      }
    );

    socket.emit("getOnlineVisitors");

    return () => {
      if (!socket) return;

      socket.off("onlineVisitors");
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const handleResetQuery = ({
      chatId,
    }: {
      chatId: string;
      sender: string;
    }) => {
      if (tickets.find(ticket => ticket?._id === chatId) !== undefined) {
        refresh();
      }
    };

    socket.on("updateVisitorDataReceived", handleResetQuery);
    socket.on("messageReceivedFromBot", handleResetQuery);

    socket.on("seenReceivedInChat", handleResetQuery);
    socket.on("messageReceived", handleResetQuery);

    return () => {
      if (!socket) return;

      socket.off("updateVisitorDataReceived");
      socket.off("messageReceivedFromBot");

      socket.off("seenReceivedInChat");
      socket.off("messageReceived");
    };
  }, [socket, tickets]);

  useEffect(() => {
    if (!socket) return;

    const handleTypingReceived = ({
      chatId,
      sender,
    }: {
      chatId: string;
      sender: string;
    }) => {
      if (typingVisitors.find(ticket => ticket.chatId === chatId) === undefined)
        setTypingVisitors(prev => [...prev, { chatId, sender }]);
    };

    const handleStopTypingReceived = ({
      chatId,
    }: {
      chatId: string;
      sender: string;
    }) => {
      setTypingVisitors(prev =>
        prev.filter(ticket => ticket.chatId !== chatId)
      );
    };

    const handleOnlineVisitorReceived = ({
      sender,
      widgetId,
    }: {
      sender: string;
      widgetId: string;
    }) => {
      if (
        widgetId === assistKey &&
        onlineVisitors.find(visitor => visitor === sender) === undefined
      )
        setOnlineVisitors(visitors => [...visitors, sender]);
    };

    const handleOfflineVisitorReceived = ({
      sender,
      widgetId,
    }: {
      sender: string;
      widgetId: string;
    }) => {
      if (widgetId === assistKey)
        setOnlineVisitors(visitors =>
          visitors.filter(visitor => visitor !== sender)
        );
    };

    const handleNewTicket = () => {
      refresh();
    };

    socket.on("newTicketReceived", handleNewTicket);

    socket.on("typingReceived", handleTypingReceived);
    socket.on("stopTypingReceived", handleStopTypingReceived);

    socket.on("onlineVisitorReceived", handleOnlineVisitorReceived);
    socket.on("offlineVisitorReceived", handleOfflineVisitorReceived);

    return () => {
      if (!socket) return;

      socket.off("newTicketReceived");

      socket.off("typingReceived");
      socket.off("stopTypingReceived");

      socket.off("onlineVisitorReceived");
      socket.off("offlineVisitorReceived");
    };
  }, [socket]);

  useEffect(() => {
    if (!isFetching && !tickets.length) toggleCodeSnippetModal();
  }, [isFetching]);

  useEffect(() => {
    if (inView) {
      loadMore();
    }
  }, [inView]);

  return (
    <div
      className={clsx(
        "absolute left-0 h-full md:relative bg-white shadow-3xl transition-all duration-300 z-[1] flex flex-col gap-4 lg:w-[30%] md:py-2",
        { "w-0 overflow-hidden": !drawerOpen },
        { "py-2 w-full md:w-[50%]": drawerOpen }
      )}
    >
      <Dropdown
        placement={`bottom-end`}
        btnClassName={clsx(
          "px-2.5 py-1.5 w-24 border bg-white text-black rounded self-end",
          { "mr-10": drawerOpen },
          { "mr-4": !drawerOpen }
        )}
        onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
          e.stopPropagation()
        }
        button={
          <span className="flex relative items-center justify-between capitalize">
            {status.toLowerCase()}
            <ArrowDownSVG className="h-3 w-3" />
          </span>
        }
      >
        <ul className="p-4 mt-1 w-[120px] rounded-lg font-semibold  overflow-visible bg-white text-dark border">
          <li>
            <button
              className="flex items-center justify-between w-full"
              onClick={() => setStatus("All")}
            >
              All
              {status === "All" && (
                <CheckmarkSVG
                  strokeWidth={3}
                  className="h-4 w-4 text-primary"
                />
              )}
            </button>
          </li>
          <li>
            <button
              className="flex items-center justify-between w-full"
              onClick={() => setStatus(TicketStatusEnum.OPEN)}
            >
              Open
              {status === TicketStatusEnum.OPEN && (
                <CheckmarkSVG
                  strokeWidth={3}
                  className="h-4 w-4 text-primary"
                />
              )}
            </button>
          </li>
          <li>
            <button
              className="flex items-center justify-between w-full"
              onClick={() => setStatus(TicketStatusEnum.CLOSED)}
            >
              Closed
              {status === TicketStatusEnum.CLOSED && (
                <CheckmarkSVG
                  strokeWidth={3}
                  className="h-4 w-4 text-primary"
                />
              )}
            </button>
          </li>
        </ul>
      </Dropdown>

      <span
        className="absolute lg:hidden right-0 top-[12px] z-20 cursor-pointer bg-dark rounded-l-md p-1 flex items-center justify-center"
        onClick={toggleDrawer}
      >
        <img src={"/assets/assist/chevron-left.svg"} />
      </span>

      <PerfectScrollbar className="flex flex-col gap-1 px-4 py-2 max-h-[64vh] overflow-auto overscroll-contain">
        {isLoading && (
          <div className="w-full h-full flex items-center justify-center">
            <LoadingSpinner isLoading color="#4361ee" />
          </div>
        )}
        {tickets?.length ? (
          <div className="flex flex-col gap-4">
            {tickets?.map(ticket => (
              <TicketCard
                key={ticket._id}
                ticket={ticket}
                onClick={() => {
                  setSelectedTicket(ticket);
                }}
                selected={ticket?._id === selectedTicket?._id}
                isTyping={
                  !!typingVisitors.find(
                    tTicket =>
                      tTicket.chatId === ticket._id &&
                      tTicket.sender !== session?.id
                  )
                }
                isOnline={
                  !!onlineVisitors.find(
                    visitor => visitor === ticket?.visitor?._id
                  )
                }
              />
            ))}
            <div
              className="w-full flex items-center justify-center shrink-0 h-5"
              ref={ref}
            >
              {isFetching && <LoadingSpinner isLoading color="#4361ee" />}
            </div>
          </div>
        ) : (
          !isLoading && (
            <div className="w-full h-full flex items-center justify-center text-black">
              No Available Tickets
            </div>
          )
        )}
      </PerfectScrollbar>
    </div>
  );
};

export default Tickets;
