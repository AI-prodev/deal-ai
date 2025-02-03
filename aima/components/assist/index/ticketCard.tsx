import { ITicket, TicketStatusEnum } from "@/interfaces/ITicket";
import { IRootState } from "@/store";
import { useUpdateTicketStatusMutation } from "@/store/features/assistApi";
import moment from "moment";
import React from "react";
import { useSelector } from "react-redux";
import { getAvatarBgColorFromLetters } from "../../../helpers/assistHelpers";
import Dropdown from "../../Dropdown";
import { useSocketContext } from "@/contexts/SocketConnection";
import { useSession } from "next-auth/react";
import clsx from "clsx";

interface TicketCardProps {
  ticket: Omit<ITicket, "messages">;
  selected: boolean;
  isTyping: boolean;
  isOnline: boolean;
  onClick: VoidFunction;
}

const TicketCard = ({
  ticket,
  isTyping,
  isOnline,
  selected,
  onClick,
}: TicketCardProps) => {
  const socket = useSocketContext();
  const { data: session } = useSession();

  const isRtl =
    useSelector((state: IRootState) => state.themeConfig.rtlClass) === "rtl"
      ? true
      : false;

  const isTicketClosed = ticket?.status === TicketStatusEnum.CLOSED;
  const firstLetterFromTitle = ticket.title?.at(0)?.toUpperCase();
  const avatarBgColor = getAvatarBgColorFromLetters(firstLetterFromTitle);
  const unreadCount = ticket?.unreadCount;

  const [updateStatus] = useUpdateTicketStatusMutation();
  const handleChangeStatus = async (e: React.MouseEvent<HTMLLIElement>) => {
    await updateStatus({ id: ticket?._id });
    socket?.emit("sendChangeStatus", {
      chatId: ticket?._id,
      sender: session?.id,
    });
  };
  return (
    <div
      onClick={() => {
        if (selected) return;
        else onClick();
      }}
      className={`no-underline max-h-[100px] relative flex flex-row gap-2 p-3 rounded-3xl transition-colors cursor-pointer duration-100 text-black ${selected ? "bg-[#cfd6f7]" : "bg-white-light hover:bg-[#cfd6f7]"}`}
    >
      {/* Avatar */}
      <div
        className={`w-6 h-6 bg-${avatarBgColor} relative text-white rounded-xl text-xs flex items-center justify-center`}
      >
        {firstLetterFromTitle}
        {isOnline && (
          <div className="w-2 h-2 rounded-full absolute bottom-0 right-0 bg-success" />
        )}
      </div>

      {/* Details */}
      <div className="flex flex-col flex-1 gap-2">
        <div
          className="flex flex-row items-center h-4 gap-1"
          onClick={e => e.stopPropagation()}
        >
          <div className="text-sm leading-4 line-clamp-1 break-all font-semibold w-[90%]">
            {ticket.title}
          </div>
          <div
            onClick={() => {
              if (selected) return;
              else onClick();
            }}
            className={clsx(
              "px-1.5 rounded-md flex items-center justify-center min-w-11",
              { "bg-success": ticket.status === TicketStatusEnum.OPEN },
              { "bg-danger": ticket.status === TicketStatusEnum.CLOSED }
            )}
          >
            <span className="text-white font-bold text-[10px]">
              {ticket.status}
            </span>
          </div>
          {/* Context Menu */}
          <Dropdown
            placement={`${isRtl ? "bottom-start" : "bottom-end"}`}
            btnClassName="active:bg-white-light/50 p-1.5 rounded-full"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
              e.stopPropagation()
            }
            button={
              <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                <circle cx="2.5" cy="8.5" r="1.5"></circle>
                <circle cx="7.5" cy="8.5" r="1.5"></circle>
                <circle cx="12.5" cy="8.5" r="1.5"></circle>
              </svg>
            }
          >
            <ul className="p-4 w-[100px] h-full rounded-lg font-semibold z-50 overflow-visible dark:bg-[#060818] text-dark dark:text-white-dark dark:text-white-light/90">
              <li
                className={`${isTicketClosed ? "text-danger hover:text-danger-light" : "hover:text-primary "}`}
                onClick={handleChangeStatus}
              >
                {isTicketClosed ? "Re-open" : "Close"}
              </li>
            </ul>
          </Dropdown>
        </div>
        <div className="flex gap-2 overflow-hidden">
          <div className="flex flex-col text-sm leading-4 gap-1 w-full">
            <div className="flex items-center gap-1">
              <div className="break-all line-clamp-1">
                {isTyping ? `typing...` : ticket.description}
              </div>
              {unreadCount !== 0 && !selected && (
                <span
                  className={`flex items-center shrink-0 justify-center rounded-full w-5 h-5 bg-danger text-white font-bold ${unreadCount > 9 ? "text-[11px] leading-10" : unreadCount > 99 ? "text-[10px] leading-10" : "text-xs"}`}
                >
                  {unreadCount > 99 ? "+99" : unreadCount}
                </span>
              )}
            </div>
          </div>
          <div className="text-sm leading-4 font-normal text-right whitespace-nowrap mt-auto">
            {moment(ticket.lastMessageCreatedAt).fromNow()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
