import { useSocketContext } from "@/contexts/SocketConnection";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import {
  IAssistSettings,
  ITicket,
  TicketStatusEnum,
} from "@/interfaces/ITicket";
import { IUser } from "@/interfaces/IUser";
import LoadingSpinner from "@/pages/components/loadingSpinner";
import {
  useCreateVisitorMessageMutation,
  useGetVisitorTicketByIdQuery,
  useGetVisitorTicketMessagesByIdQuery,
} from "@/store/features/assistApi";
import { useParams, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import Message from "./message";

interface ResumeTicketChatboxProps {
  settings?: IAssistSettings;
  isTyping: boolean;
}

const ResumeTicketChatbox = ({
  settings,
  isTyping,
}: ResumeTicketChatboxProps) => {
  const { get } = useSearchParams();
  const { key: assistKey } = useParams<{ key?: string }>() || {};
  const resumeTicket = get("resumeTicket");
  const socket = useSocketContext();
  const { inView, ref } = useInView();

  const containerRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const [text, setText] = useState<string>("");
  const [hasStartedTyping, setHasStartedTyping] = useState<boolean>(false);

  const [ticket, setTicket] = useState<Omit<ITicket, "messages"> | null>(null);

  const { data, isError } = useGetVisitorTicketByIdQuery(
    { id: resumeTicket!, assistKey: assistKey! },
    { skip: !resumeTicket || !assistKey }
  );

  const {
    combinedData: ticketMessages,
    isLoading: isTicketMessegesLoading,
    isFetching,
    refresh,
    loadMore,
  } = useInfiniteScroll(
    useGetVisitorTicketMessagesByIdQuery,
    {
      id: ticket?._id,
      visitorId: ticket?.visitor?._id,
      assistKey,
    },
    { skip: !ticket?._id || !ticket?.visitor?._id || !assistKey }
  );

  const isTicketClosed = ticket?.status === TicketStatusEnum.CLOSED;

  const [
    createMessage,
    { isLoading: isCreateMessageLoading, isSuccess: isCreateMessageSuccess },
  ] = useCreateVisitorMessageMutation();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);

    if (!hasStartedTyping && newText && ticket?._id) {
      handleStartTypingEvent();
    } else if (hasStartedTyping && !newText && ticket?._id) {
      handleStopTypingEvent();
    }
  };

  const handleStartTypingEvent = () => {
    setHasStartedTyping(true);
    socket?.emit("typing", {
      chatId: ticket?._id,
      sender: ticket?.visitor?._id,
    });
    socket?.emit("typingInChat", {
      chatId: ticket?._id,
      sender: ticket?.visitor?._id,
    });
  };

  const handleStopTypingEvent = () => {
    setHasStartedTyping(false);
    socket?.emit("stopTyping", {
      chatId: ticket?._id,
      sender: ticket?.visitor?._id,
    });
    socket?.emit("stopTypingInChat", {
      chatId: ticket?._id,
      sender: ticket?.visitor?._id,
    });
  };

  const mutateMessage = async () => {
    if (ticket?._id) {
      await createMessage({
        id: ticket._id,
        assistKey: assistKey!,
        visitorId: ticket?.visitor?._id!,
        message: text,
      });
      socket?.emit("sendMessage", {
        chatId: ticket?._id,
        sender: ticket?.visitor?._id,
      });
      socket?.emit("sendMessageInChat", {
        chatId: ticket?._id,
        sender: ticket?.visitor?._id,
      });
      handleStopTypingEvent();
    }
    setText("");
    refresh();
  };

  const handleCreateMessage = async (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter" && text.trim()) {
      e.preventDefault();
      await mutateMessage();
    }
  };

  const handleClickToCreateMessage = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    await mutateMessage();
  };

  useEffect(() => {
    if (data) {
      setTicket(data);
    }
  }, [data]);

  useEffect(() => {
    if (!socket || !ticket?._id) return;

    const handleRefreshQuery = ({
      chatId,
      sender,
    }: {
      chatId: string;
      sender: string;
    }) => {
      if (sender !== ticket?.visitor?._id && ticket?._id === chatId) {
        refresh();
      }
    };

    const handleStatusReceived = ({
      chatId,
      sender,
    }: {
      chatId: string;
      sender: string;
    }) => {
      if (ticket?._id === chatId) {
        setTicket(prev => ({
          ...prev!,
          status:
            prev!.status === TicketStatusEnum.OPEN
              ? TicketStatusEnum.CLOSED
              : TicketStatusEnum.OPEN,
        }));
      }
    };

    socket.on("messageReceivedFromBot", handleRefreshQuery);
    socket.on("messageReceivedInChat", handleRefreshQuery);
    socket.on("changeStatusReceived", handleStatusReceived);

    return () => {
      if (!socket || !ticket?._id) return;

      socket.off("messageReceivedFromBot");
      socket.off("messageReceivedInChat");
      socket.off("changeStatusReceived");
    };
  }, [socket, ticket?.visitor?._id, ticket?._id]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [containerRef, ticket?._id, isCreateMessageSuccess]);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, [textAreaRef, ticket?._id, isCreateMessageSuccess]);

  // This event is for updating seen to user when visitor joins the chat
  // useEffect(() => {
  //     if (!isTicketMessegesLoading || !socket) return;

  //     socket.emit("sendSeenInChat", {
  //         chatId: ticket?._id,
  //         sender: visitorId,
  //     });
  // }, []);

  useEffect(() => {
    if (inView) {
      loadMore();
    }
  }, [inView]);

  return (
    <div className="h-full w-full flex flex-col">
      <div
        className="flex items-center justify-center h-[90px] shrink-0 text-white px-2 py-2"
        style={{ backgroundColor: settings?.color }}
      >
        <h1 className="text-lg font-bold">{settings?.name}</h1>
      </div>
      <div className="h-full w-full flex flex-col overflow-hidden">
        {isTicketMessegesLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <LoadingSpinner isLoading color={settings?.color} />
          </div>
        ) : isError ? (
          <div className="h-full w-full flex flex-col gap-6 items-center justify-center">
            <img
              src={"/assets/images/close.svg"}
              className="h-8 w-8 bg-black rounded-full"
            />
            <h1 className="text-lg font-semibold">Ticket not found</h1>
          </div>
        ) : (
          <div
            className="h-full w-full flex flex-col-reverse gap-4 p-6 overflow-auto"
            ref={containerRef}
          >
            {isTicketClosed && (
              <span className="text-xs text-center p-2 rounded-lg text-danger">
                This ticket has been closed
              </span>
            )}
            {isTyping && (
              <Message
                message={{
                  _id: "-1",
                  message: "Typing...",
                  sentBy: {
                    firstName: ticket?.user?.firstName,
                    lastName: ticket?.user?.lastName,
                  } as IUser,
                }}
              />
            )}

            {ticketMessages?.map(message => (
              <Message
                settings={settings}
                key={message._id}
                ticketId={ticket?._id}
                setTicket={setTicket}
                message={message}
                visitor={ticket?.visitor}
              />
            ))}
            <div
              className="w-full flex items-center justify-center shrink-0"
              ref={ref}
            >
              {isFetching && (
                <LoadingSpinner isLoading color={settings?.color} />
              )}
            </div>
          </div>
        )}
        <div className="w-full h-12 box-border relative border-t border-t-gray-300">
          <textarea
            ref={textAreaRef}
            className="w-full min-h-12 text-sm whitespace-pre-wrap resize-none pl-6 pr-10 py-3 outline-none box-border overflow-hidden overflow-y-auto"
            value={text}
            onBlur={handleStopTypingEvent}
            onChange={handleChange}
            onKeyDown={handleCreateMessage}
            autoFocus
            disabled={isTicketClosed || isCreateMessageLoading || isError}
            placeholder={ticket?._id ? "Write a reply..." : "Message..."}
          />
          <button
            disabled={
              isTicketClosed || isCreateMessageLoading || !text || isError
            }
            onClick={handleClickToCreateMessage}
            className={`absolute bottom-[50%] translate-y-[50%] right-7`}
            style={{
              color: text ? settings?.color : "#c5cbe0",
            }}
          >
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
    </div>
  );
};

export default ResumeTicketChatbox;
