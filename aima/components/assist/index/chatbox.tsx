import { useSocketContext } from "@/contexts/SocketConnection";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import {
  IAssistSettings,
  ITicket,
  MessageTypeEnum,
  TicketStatusEnum,
} from "@/interfaces/ITicket";
import { IUser } from "@/interfaces/IUser";
import LoadingSpinner from "@/pages/components/loadingSpinner";
import {
  useCreateImageMessageMutation,
  useCreateMessageMutation,
  useGetTicketMessagesByIdQuery,
  useUpdateTicketStatusMutation,
} from "@/store/features/assistApi";
import { useSession } from "next-auth/react";
import React, { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import Message from "./message";
import RightMenu from "./rightMenu";
import Head from "next/head";
import clsx from "clsx";
import { showErrorToast } from "@/utils/toast";

interface ChatboxProps {
  ticket: Omit<ITicket, "messages"> | null;
  setTicket: React.Dispatch<
    React.SetStateAction<Omit<ITicket, "messages"> | null>
  >;
  settings?: IAssistSettings;
  isChatboxLoading: boolean;
}

const Chatbox = ({
  ticket,
  setTicket,
  settings,
  isChatboxLoading,
}: ChatboxProps) => {
  const socket = useSocketContext();
  const { data: session } = useSession();

  const { inView, ref } = useInView();

  const containerRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const [text, setText] = useState<string>("");
  const [senderIsTyping, setSenderIsTyping] = useState<boolean>(false);
  const [hasStartedTyping, setHasStartedTyping] = useState<boolean>(false);

  const [rightMenuOpen, setRightMenuOpen] = useState<boolean>(false);

  const {
    combinedData: ticketMessages,
    isLoading: isTicketMessegesLoading,
    isFetching,
    refresh,
    loadMore,
  } = useInfiniteScroll(
    useGetTicketMessagesByIdQuery,
    { id: ticket?._id },
    { skip: !ticket?._id }
  );

  const [updateStatus, { isLoading: isUpdateStatusLoading }] =
    useUpdateTicketStatusMutation();
  const [
    createMessage,
    { isLoading: isCreateMessageLoading, isSuccess: isCreateMessageSuccess },
  ] = useCreateMessageMutation();
  const [
    createImageMessage,
    {
      isLoading: isCreateImageMessageLoading,
      isSuccess: isCreateImageMessageSuccess,
    },
  ] = useCreateImageMessageMutation();

  const isTicketClosed = ticket?.status === TicketStatusEnum.CLOSED;
  const isTicketDisabled =
    isChatboxLoading ||
    !ticket ||
    isCreateMessageLoading ||
    isCreateImageMessageLoading;

  const handleChangeStatus = async () => {
    await updateStatus({ id: ticket?._id! });
    socket?.emit("sendChangeStatus", {
      chatId: ticket?._id,
      sender: session?.id,
    });

    setTicket &&
      setTicket(prev => ({
        ...prev!,
        status:
          prev!.status === TicketStatusEnum.OPEN
            ? TicketStatusEnum.CLOSED
            : TicketStatusEnum.OPEN,
      }));
  };

  const handleChangeText = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);

    if (!hasStartedTyping && newText) {
      handleStartTypingEvent();
    } else if (hasStartedTyping && !newText) {
      handleStopTypingEvent();
    }
  };

  const handleStartTypingEvent = () => {
    setHasStartedTyping(true);
    socket?.emit("typing", {
      chatId: ticket?._id,
      sender: session?.id,
    });
    socket?.emit("typingInChat", {
      chatId: ticket?._id,
      sender: session?.id,
    });
  };

  const handleStopTypingEvent = () => {
    setHasStartedTyping(false);
    socket?.emit("stopTyping", {
      chatId: ticket?._id,
      sender: session?.id,
    });
    socket?.emit("stopTypingInChat", {
      chatId: ticket?._id,
      sender: session?.id,
    });
  };

  const mutateMessage = async () => {
    if (!text) return;

    await createMessage({
      id: ticket?._id!,
      message: text,
    });
    socket?.emit("sendMessage", {
      chatId: ticket?._id,
      sender: session?.id,
    });
    socket?.emit("sendMessageInChat", {
      chatId: ticket?._id,
      sender: session?.id,
    });
    handleStopTypingEvent();
    if (ticket?.status === TicketStatusEnum.CLOSED) {
      setTicket &&
        setTicket(prev => ({
          ...prev!,
          status: TicketStatusEnum.OPEN,
        }));
    }
    setText("");
    refresh();
  };

  const handleSubmitMessage = async (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.code === "Enter" && text.trim()) {
      e.preventDefault();
      await mutateMessage();
    }
  };

  const handleCreateImageMessage = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || !ticket?._id) return;
    if (files.length > 5) showErrorToast("Can't upload more than 5 images");

    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file);
    }
    await createImageMessage({ id: ticket?._id, data: formData });
    if (ticket?.status === TicketStatusEnum.CLOSED) {
      setTicket &&
        setTicket(prev => ({
          ...prev!,
          status: TicketStatusEnum.OPEN,
        }));
    }
    socket?.emit("sendMessage", {
      chatId: ticket?._id,
      sender: session?.id,
    });
    socket?.emit("sendMessageInChat", {
      chatId: ticket?._id,
      sender: session?.id,
    });
    e.target.value = "";
  };

  const handleToggleRightMenu = () => setRightMenuOpen(prev => !prev);

  const handleClickToCreateMessage = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    await mutateMessage();
  };

  useEffect(() => {
    if (!socket || !ticket?._id) return;

    const handleUpdateVisitorData = ({
      chatId,
      data,
    }: {
      chatId: string;
      data: any;
    }) => {
      if (ticket?._id === chatId)
        setTicket(prev => ({
          ...prev!,
          visitor: data.visitor!,
          title: data.visitor.name,
        }));
    };

    const handleMessageReceived = ({
      chatId,
      sender,
    }: {
      chatId: string;
      sender: string;
    }) => {
      if (sender !== session?.id && ticket?._id === chatId) {
        if (ticket?.status === TicketStatusEnum.CLOSED) {
          setTicket &&
            setTicket(prev => ({
              ...prev!,
              status: TicketStatusEnum.OPEN,
            }));
        }
        refresh();
      }
    };
    const handleTypingReceived = ({
      chatId,
      sender,
    }: {
      chatId: string;
      sender: string;
    }) => {
      if (sender !== session?.id && chatId === ticket?._id) {
        setSenderIsTyping(true);
      }
    };

    const handleStopTypingReceived = ({
      chatId,
      sender,
    }: {
      chatId: string;
      sender: string;
    }) => {
      if (sender !== session?.id && chatId === ticket?._id) {
        setSenderIsTyping(false);
      }
    };

    socket.on("updateVisitorDataReceivedInChat", handleUpdateVisitorData);

    socket.on("messageReceivedInChat", handleMessageReceived);
    socket.on("messageReceivedFromBot", handleMessageReceived);

    socket.on("typingReceivedInChat", handleTypingReceived);
    socket.on("stopTypingReceivedInChat", handleStopTypingReceived);

    return () => {
      if (!socket || !ticket?._id) return;

      socket.off("updateVisitorDataReceivedInChat");

      socket.off("messageReceivedInChat");
      socket.off("messageReceivedFromBot");

      socket.off("typingReceivedInChat");
      socket.off("stopTypingReceivedInChat");
    };
  }, [socket, ticket?._id, ticket?.status]); //socket, , session?.id

  // Scroll to bottom always
  useEffect(() => {
    if (containerRef.current && ticket?._id) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [
    containerRef,
    ticket?._id,
    isCreateMessageSuccess,
    isCreateImageMessageSuccess,
  ]);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, [
    textAreaRef,
    ticket?._id,
    isCreateMessageSuccess,
    isCreateImageMessageSuccess,
  ]);

  // This event is for updating seen to visitor when user joins the chat
  // useEffect(() => {
  //     if (!isTicketMessegesLoading || !socket) return;

  //     socket.emit("sendSeenInChat", {
  //         chatId: ticket?._id,
  //         sender: session?.id,
  //     });
  // }, []);

  useEffect(() => {
    if (inView) {
      loadMore();
    }
  }, [inView]);

  useEffect(() => {
    return () => {
      refresh();
    };
  }, [ticket?._id]);

  return (
    <>
      <div className="flex h-full w-full overflow-hidden">
        <div className="flex flex-col relative h-full w-full border-r-[2.5px] border-r-[#ebedf2] overflow-hidden">
          {/* Chat Header */}
          <div
            className={`flex items-center justify-between gap-2 py-4 px-5 h-16 border-b-[2.5px] border-b-[#ebedf2]`}
          >
            <div className="font-medium text-black flex flex-col flex-1 md:text-lg">
              {/* <span>{ticket?.title}</span> */}
              <span>{ticket?.visitor?.name}</span>
            </div>
            {ticket?._id && (
              <div className="flex items-center gap-2">
                <button
                  disabled={isUpdateStatusLoading}
                  onClick={handleChangeStatus}
                  className={`rounded ${isTicketClosed ? "bg-danger" : "bg-primary"} disabled:bg-white-light disabled:cursor-not-allowed px-4 h-7 md:h-10 min-w-24 text-white`}
                >
                  {isUpdateStatusLoading ? (
                    <LoadingSpinner isLoading color="#4361ee" />
                  ) : isTicketClosed ? (
                    "Re-open"
                  ) : (
                    "Close"
                  )}
                </button>
                <button
                  className={`rounded px-4 h-7 md:h-10 border border-white-light transition-all ${rightMenuOpen ? "w-0 hidden" : "w-full"}`}
                  onClick={handleToggleRightMenu}
                >
                  <img src={"/assets/assist/drawer.svg"} />
                </button>
              </div>
            )}
          </div>
          {/* Chat Body */}
          <div className="flex flex-col w-full h-full pr-1 overflow-hidden">
            {!ticket?._id && (
              <div className="flex items-center justify-center h-full w-full">
                <span className="text-black">Please select a ticket first</span>
              </div>
            )}
            {isChatboxLoading ? (
              <div className="flex items-center justify-center h-full w-full">
                <LoadingSpinner isLoading color="#4361ee" />
              </div>
            ) : (
              ticket?._id && (
                <div
                  ref={containerRef}
                  className={`flex flex-col-reverse gap-4 px-6 pt-4 pb-32 overflow-auto overscroll-contain`}
                >
                  {senderIsTyping && (
                    <Message
                      message={{
                        _id: "-1",
                        message: "Typing...",
                        type: MessageTypeEnum.TEXT,
                        sentBy: ticket.visitor,
                      }}
                      isFirstMessageInARow={false}
                      isLastMessageInARow={false}
                    />
                  )}
                  {((isCreateMessageLoading && !isCreateMessageSuccess) ||
                    (isCreateImageMessageLoading &&
                      !isCreateImageMessageSuccess)) && (
                    <div className="flex items-center justify-center h-full w-full">
                      <LoadingSpinner isLoading color="#4361ee" />
                    </div>
                  )}

                  {ticketMessages?.map((message, idx) => {
                    const isLastMessageInARow =
                      ((ticketMessages?.[idx]?.sentBy as IUser)?._id ||
                        ticketMessages?.[idx]?.sentBy) !==
                      ((ticketMessages?.[idx - 1]?.sentBy as IUser)?._id ||
                        ticketMessages?.[idx - 1]?.sentBy);

                    const isFirstMessageInARow =
                      ((ticketMessages?.[idx + 1]?.sentBy as IUser)?._id ||
                        ticketMessages?.[idx + 1]?.sentBy) !==
                      ((ticketMessages?.[idx]?.sentBy as IUser)?._id ||
                        ticketMessages?.[idx]?.sentBy);

                    return (
                      <Message
                        key={message._id}
                        message={message}
                        visitor={ticket.visitor}
                        isFirstMessageInARow={isFirstMessageInARow}
                        isLastMessageInARow={isLastMessageInARow}
                      />
                    );
                  })}
                  <div
                    className="w-full h-10 flex items-center justify-center shrink-0"
                    ref={ref}
                  >
                    {isFetching && ticketMessages.length && (
                      <LoadingSpinner isLoading color="#4361ee" />
                    )}
                  </div>
                </div>
              )
            )}
            <div className="absolute bottom-2 left-0 right-0 w-5/6 h-full max-h-[100px] mx-auto mb-0">
              <textarea
                disabled={isTicketDisabled}
                ref={textAreaRef}
                className="w-full h-full resize-none disabled:cursor-not-allowed rounded-md border border-white-light shadow-xl px-4 py-2 text-sm font-semibold text-black !outline-none focus:border-primary focus:ring-transparent"
                placeholder="Send a message..."
                onKeyDown={handleSubmitMessage}
                onBlur={handleStopTypingEvent}
                onChange={handleChangeText}
                value={text}
              ></textarea>
              <div className="absolute bottom-[50%] translate-y-[50%] right-7 flex items-center gap-1">
                <>
                  <label
                    htmlFor="file-upload"
                    className={clsx(
                      "flex items-center justify-center mb-0",
                      {
                        "cursor-not-allowed text-white-dark": isTicketDisabled,
                      },
                      { "cursor-pointer text-primary": !isTicketDisabled }
                    )}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      height="24"
                      width="24"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                      />
                    </svg>
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    className="sr-only"
                    disabled={isTicketDisabled}
                    onChange={handleCreateImageMessage}
                    multiple
                  />
                </>
                <button
                  disabled={isTicketDisabled}
                  onClick={handleClickToCreateMessage}
                  className={` ${text ? "text-primary" : "text-white-dark"} disabled:cursor-not-allowed p-2`}
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
        </div>
        <RightMenu
          ticket={ticket}
          settings={settings}
          open={rightMenuOpen}
          onClose={handleToggleRightMenu}
        />
      </div>
    </>
  );
};

export default Chatbox;
