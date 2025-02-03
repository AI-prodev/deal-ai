import { ITicket } from "@/interfaces/ITicket";
import { getAvatarBgColorFromLetters } from "../../../helpers/assistHelpers";

interface TicketCardProps {
  ticket: Omit<ITicket, "messages">;
  onHandleSetSelectedTicket: (ticket: Omit<ITicket, "messages">) => void;
  isUserTyping: boolean;
  isUserOnline: boolean;
}

const TicketCard = ({
  ticket,
  isUserTyping,
  isUserOnline,
  onHandleSetSelectedTicket,
}: TicketCardProps) => {
  const firstLetterFromTitle = ticket?.user?.firstName?.at(0);
  const avatarBgColor = getAvatarBgColorFromLetters(firstLetterFromTitle);
  const unreadCount = ticket?.unreadCount;

  return (
    <div
      className="flex w-full gap-2 px-5 py-4 items-center cursor-pointer hover:bg-white-light"
      onClick={() => onHandleSetSelectedTicket(ticket)}
    >
      <div className="flex items-center gap-2 w-[95%]">
        {/* Avatar */}
        <div
          className={`w-10 h-10 bg-${avatarBgColor} relative text-white rounded-full text-sm flex items-center justify-center`}
        >
          {firstLetterFromTitle}
          {isUserOnline && (
            <div className="w-3 h-3 rounded-full absolute bottom-0 right-0 bg-success" />
          )}
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm line-clamp-1 break-all">{ticket.title}</span>
          <div className="flex items-center gap-1">
            <span className="text-sm line-clamp-1">
              {isUserTyping
                ? `${ticket.user?.firstName} is typing...`
                : ticket.user?.firstName}
            </span>
            {unreadCount !== 0 && (
              <span
                className={`flex items-center shrink-0 justify-center rounded-full w-5 h-5 bg-danger text-white font-bold ${unreadCount > 9 ? "text-[11px] leading-10" : unreadCount > 99 ? "text-[10px] leading-10" : "text-xs"}`}
              >
                {unreadCount > 99 ? "+99" : unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
      >
        <path
          d="M5.42773 4.70898C5.46387 4.85254 5.53809 4.98828 5.65039 5.10059L8.54932 8L5.64893 10.9004C5.31689 11.2324 5.31689 11.7705 5.64893 12.1025C5.98096 12.4336 6.51904 12.4336 6.85107 12.1025L10.3516 8.60059C10.5591 8.39355 10.6367 8.10449 10.585 7.83691C10.5537 7.67578 10.4761 7.52246 10.3516 7.39844L6.85254 3.89941C6.52051 3.56738 5.98242 3.56738 5.65039 3.89941C5.43066 4.11816 5.35645 4.42871 5.42773 4.70898Z"
          fill="currentColor"
        ></path>
      </svg>
    </div>
  );
};

export default TicketCard;
