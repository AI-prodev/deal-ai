import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import { IAssistSettings, ITicket } from "@/interfaces/ITicket";
import LoadingSpinner from "@/pages/components/loadingSpinner";
import { useGetVisitorTicketsQuery } from "@/store/features/assistApi";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useSearchParam } from "react-use";
import TicketCard from "./ticketCard";
import { useSocketContext } from "@/contexts/SocketConnection";

interface TicketsProps {
  typingTickets: {
    chatId: string;
    sender: string;
  }[];
  settings?: IAssistSettings;
  onHandleAddNewMessage: VoidFunction;
  onHandleSetSelectedTicket: (ticket: Omit<ITicket, "messages">) => void;
}

const Tickets = ({
  typingTickets,
  settings,
  onHandleAddNewMessage,
  onHandleSetSelectedTicket,
}: TicketsProps) => {
  const socket = useSocketContext();
  const visitorId = useSearchParam("visitorId")!;

  const { key: assistKey } = useParams<{ key?: string }>() || {};
  const { inView, ref } = useInView();

  const [isUserOnline, setIsUserOnline] = useState<boolean>(false);

  const {
    combinedData: tickets,
    isFetching,
    refresh,
    loadMore,
  } = useInfiniteScroll(
    useGetVisitorTicketsQuery,
    {
      visitorId,
      assistKey,
    },
    { skip: !assistKey || !visitorId }
  );

  useEffect(() => {
    if (!socket || !assistKey) return;

    socket.on("onlineUsers", ({ widgetId }: { widgetId: string }) => {
      if (widgetId === assistKey?.at(0)) setIsUserOnline(true);
    });

    socket.emit("getOnlineUsers");

    return () => {
      if (!socket || !assistKey) return;

      socket.off("onlineUsers");
    };
  }, [socket, assistKey]);

  useEffect(() => {
    if (!socket || !assistKey) return;

    const handleRefreshQuery = ({
      chatId,
    }: {
      chatId: string;
      sender: string;
    }) => {
      if (tickets.find(ticket => ticket?._id === chatId) !== undefined)
        refresh();
    };

    const handleOnlineUserReceived = ({ widgetId }: { widgetId: string }) => {
      if (assistKey?.at(0) === widgetId) setIsUserOnline(true);
    };

    const handleOfflineUserReceived = ({ widgetId }: { widgetId: string }) => {
      if (assistKey?.at(0) === widgetId) setIsUserOnline(false);
    };

    socket.on("seenReceivedInChat", handleRefreshQuery);

    socket.on("messageReceived", handleRefreshQuery);

    socket.on("changeStatusReceived", handleRefreshQuery);

    socket.on("onlineUserReceived", handleOnlineUserReceived);
    socket.on("offlineUserReceived", handleOfflineUserReceived);

    return () => {
      if (!socket || !assistKey) return;

      socket.off("seenReceivedInChat");

      socket.off("messageReceived");

      socket.off("changeStatusReceived");

      socket.off("onlineUserReceived");
      socket.off("offlineUserReceived");
    };
  }, [tickets.length]);

  useEffect(() => {
    if (inView) {
      loadMore();
    }
  }, [inView]);

  return (
    <>
      <div
        className="flex items-center justify-center h-20 shrink-0 font-bold text-white"
        style={{ backgroundColor: settings?.color }}
      >
        Messages
      </div>
      <div className="h-full w-full overflow-auto">
        {isFetching && !tickets?.length && (
          <div className="w-full h-full flex items-center justify-center">
            <LoadingSpinner isLoading color={settings?.color} />
          </div>
        )}

        {/* Invalid Assist Key */}
        {!assistKey && (
          <div className="h-full w-full flex flex-col gap-6 items-center justify-center">
            <img
              src={"/assets/images/close.svg"}
              className="h-8 w-8 bg-black rounded-full"
            />
            <h1 className="text-lg font-semibold">No key provided</h1>
          </div>
        )}

        {tickets?.length ? (
          <div className="flex flex-col overflow-auto gap-3 w-full h-full pb-20 box-border">
            {tickets?.map(ticket => (
              <TicketCard
                key={ticket._id}
                ticket={ticket}
                onHandleSetSelectedTicket={onHandleSetSelectedTicket}
                isUserOnline={isUserOnline}
                isUserTyping={
                  !!typingTickets.find(tTicket => tTicket.chatId === ticket._id)
                }
              />
            ))}
            <div
              className="w-full flex items-center justify-center shrink-0 h-5"
              ref={ref}
            >
              {isFetching && (
                <LoadingSpinner isLoading color={settings?.color} />
              )}
            </div>
          </div>
        ) : (
          !tickets?.length &&
          !isFetching && (
            <div className="h-full w-full flex flex-col gap-5 items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="33"
                height="32"
                fill="none"
                viewBox="0 0 33 32"
              >
                <path
                  fill="#000"
                  fillRule="evenodd"
                  d="M27.333 2.667a2.5 2.5 0 0 1 2.5 2.5v23.778c0 1.335-1.613 2.005-2.558 1.063L21.245 24H5.667a2.5 2.5 0 0 1-2.5-2.5V5.167a2.5 2.5 0 0 1 2.5-2.5z"
                  clipRule="evenodd"
                ></path>
                <path
                  fill="#fff"
                  fillRule="evenodd"
                  d="M23 9.667a1 1 0 0 1 0 2H9.667a1 1 0 1 1 0-2zm-6 6.666a1 1 0 1 1 0 2h-6.667a1 1 0 0 1 0-2z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <h1 className="text-lg font-semibold">No messages</h1>
              <span className="text-xs">
                Messages from the team will be shown here
              </span>
            </div>
          )
        )}

        {/* Add new message */}
        <div className="absolute bottom-7 left-0 right-0">
          <button
            className="flex items-center justify-center mx-auto gap-4 text-sm text-white py-2.5 px-4 box-border rounded-xl"
            style={{
              backgroundColor: settings?.color,
            }}
            onClick={onHandleAddNewMessage}
          >
            Send us a message{" "}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 16 16"
            >
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="m4.394 14.7 9.356-5.4c1-.577 1-2.02 0-2.598L4.394 1.299a1.5 1.5 0 0 0-2.25 1.3v3.438l4.059 1.088c.494.132.494.833 0 .966l-4.06 1.087v4.224a1.5 1.5 0 0 0 2.25 1.299"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};

export default Tickets;
