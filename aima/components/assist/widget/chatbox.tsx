import { useSocketContext } from "@/contexts/SocketConnection";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import {
  IAssistSettings,
  ITicket,
  IVisitor,
  MessageTypeEnum,
  TicketStatusEnum,
} from "@/interfaces/ITicket";
import { IUser } from "@/interfaces/IUser";
import LoadingSpinner from "@/pages/components/loadingSpinner";
import {
  useCreateVisitorImageMessageMutation,
  useCreateVisitorMessageMutation,
  useCreateVisitorTicketMutation,
  useGetVisitorTicketMessagesByIdQuery,
} from "@/store/features/assistApi";
import { faker } from "@faker-js/faker";
import moment from "moment-timezone";
import { useParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useSearchParam } from "react-use";
import Message from "./message";
import UpdateUserDataModal from "../modals/updateUserDataModal";
import clsx from "clsx";
import { showErrorToast } from "@/utils/toast";

interface ChatboxProps {
  ticket: Omit<ITicket, "messages"> | null;
  setTicket: React.Dispatch<
    React.SetStateAction<Omit<ITicket, "messages"> | null>
  >;
  isTyping: boolean;
  viewChatbox: boolean;
  settings?: IAssistSettings;
  onHandleBack: VoidFunction;
}

const Chatbox = ({
  ticket,
  setTicket,
  viewChatbox,
  isTyping,
  settings,
  onHandleBack,
}: ChatboxProps) => {
  const { key: assistKey } = useParams<{ key?: string }>() || {};
  const visitorId = useSearchParam("visitorId")!;

  const { inView, ref } = useInView();

  const socket = useSocketContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const [updateUserDataModal, setUpdateUserDataModal] =
    useState<boolean>(false);
  const [userData, setUserData] = useState<IVisitor>();

  const [text, setText] = useState<string>("");
  const [hasStartedTyping, setHasStartedTyping] = useState<boolean>(false);

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
      visitorId,
      assistKey,
    },
    { skip: !ticket?._id || !visitorId || !assistKey || !viewChatbox }
  );

  const [createTicket] = useCreateVisitorTicketMutation();
  const [
    createMessage,
    { isLoading: isCreateMessageLoading, isSuccess: isCreateMessageSuccess },
  ] = useCreateVisitorMessageMutation();
  const [
    createImageMessage,
    {
      isLoading: isCreateImageMessageLoading,
      isSuccess: isCreateImageMessageSuccess,
    },
  ] = useCreateVisitorImageMessageMutation();

  const isTicketClosed = ticket?.status === TicketStatusEnum.CLOSED;
  const isTicketDisabled =
    isCreateMessageLoading || isCreateImageMessageLoading;

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
      sender: visitorId,
    });
    socket?.emit("typingInChat", {
      chatId: ticket?._id,
      sender: visitorId,
    });
  };

  const handleStopTypingEvent = () => {
    setHasStartedTyping(false);
    socket?.emit("stopTyping", {
      chatId: ticket?._id,
      sender: visitorId,
    });
    socket?.emit("stopTypingInChat", {
      chatId: ticket?._id,
      sender: visitorId,
    });
  };

  const mutateMessage = async () => {
    if (ticket?._id) {
      await createMessage({
        id: ticket._id,
        assistKey: assistKey!,
        visitorId: visitorId!,
        message: text,
      });
      socket?.emit("sendMessage", {
        chatId: ticket?._id,
        sender: visitorId,
      });
      socket?.emit("sendMessageInChat", {
        chatId: ticket?._id,
        sender: visitorId,
      });
      handleStopTypingEvent();
    } else {
      const name = userData?.name ?? faker.person.fullName();
      const email = userData?.email ?? "";
      const location = moment.tz.guess();
      const newTicket = await createTicket({
        query: {
          visitorId: visitorId!,
          assistKey: assistKey!,
        },
        body: {
          message: text,
          name,
          email,
          location,
          language: window.navigator.language,
        },
      }).unwrap();
      setTicket(newTicket.data);
      socket?.emit("newTicket", {
        chatId: newTicket?.data._id,
        sender: visitorId,
      });
    }
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
    await createImageMessage({
      id: ticket?._id,
      assistKey: assistKey!,
      visitorId,
      data: formData,
    });
    if (ticket?.status === TicketStatusEnum.CLOSED) {
      setTicket &&
        setTicket(prev => ({
          ...prev!,
          status: TicketStatusEnum.OPEN,
        }));
    }
    socket?.emit("sendMessage", {
      chatId: ticket?._id,
      sender: visitorId,
    });
    socket?.emit("sendMessageInChat", {
      chatId: ticket?._id,
      sender: visitorId,
    });
    e.target.value = "";
  };

  const handleCloseUserDataModal = (values: IVisitor) => {
    setUserData(values);
    setUpdateUserDataModal(false);
  };

  useEffect(() => {
    if (!socket || !ticket?._id) return;

    const handleRefreshQuery = ({
      chatId,
      sender,
    }: {
      chatId: string;
      sender: string;
    }) => {
      if (sender !== visitorId && ticket?._id === chatId) {
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

    const handleStatusReceived = ({
      chatId,
      sender,
    }: {
      chatId: string;
      sender: string;
    }) => {
      if (ticket?._id === chatId) {
        setTicket &&
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
  }, [socket, visitorId, ticket?._id, ticket?.status]);

  useEffect(() => {
    if (containerRef.current) {
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

  // This event is for updating seen to user when visitor joins the chat
  // useEffect(() => {
  //     if (!isTicketMessegesLoading || !socket) return;

  //     socket.emit("sendSeenInChat", {
  //         chatId: ticket?._id,
  //         sender: visitorId,
  //     });
  // }, []);

  useEffect(() => {
    if (!ticket?._id) setUpdateUserDataModal(true);
  }, [ticket?._id]);

  useEffect(() => {
    if (inView) {
      loadMore();
    }
  }, [inView]);

  return (
    <div className="h-full w-full flex flex-col">
      <div
        className="flex items-center justify-between shrink-0 text-white px-2 py-2"
        style={{ backgroundColor: settings?.color }}
      >
        <div className="flex flex-1 items-center justify-start">
          <button
            className="rounded-xl w-11 h-11 hover:bg-black/10 flex items-center justify-center"
            onClick={onHandleBack}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.7"
                d="m14 18-6-6 6-6"
              ></path>
            </svg>
          </button>
        </div>
        <h1 className="text-lg font-bold">{settings?.name}</h1>
        <div className="flex flex-1" />
      </div>
      <div className="h-full w-full flex flex-col overflow-hidden">
        {isTicketMessegesLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <LoadingSpinner isLoading color={settings?.color} />
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
            {((isCreateMessageLoading && !isCreateMessageSuccess) ||
              (isCreateImageMessageLoading &&
                !isCreateImageMessageSuccess)) && (
              <div className="flex items-center justify-center h-full w-full">
                <LoadingSpinner isLoading color="#4361ee" />
              </div>
            )}
            {isTyping && (
              <Message
                message={{
                  _id: "-1",
                  message: "Typing...",
                  type: MessageTypeEnum.TEXT,
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
            disabled={isTicketDisabled}
            placeholder={ticket?._id ? "Write a reply..." : "Message..."}
          />
          <div className="absolute bottom-[50%] translate-y-[50%] right-7 flex items-center gap-2">
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
              disabled={isTicketDisabled || !text}
              onClick={handleClickToCreateMessage}
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
      <UpdateUserDataModal
        open={updateUserDataModal}
        onClose={handleCloseUserDataModal}
      />
    </div>
  );
};

export default Chatbox;
