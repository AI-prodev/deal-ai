import Chatbox from "@/components/assist/widget/chatbox";
import ResumeTicketChatbox from "@/components/assist/widget/resumeTicketChatbox";
import Tickets from "@/components/assist/widget/tickets";
import SocketConnection, {
  useSocketContext,
} from "@/contexts/SocketConnection";
import { ITicket } from "@/interfaces/ITicket";
import { useGetAssistSettingsQuery } from "@/store/features/assistApi";
import { baseUrl } from "@/utils/baseUrl";
import axios from "axios";
import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface WidgetProps {}

const Widget = ({}: WidgetProps) => {
  const { get } = useSearchParams();
  const visitorId = get("visitorId");
  const resumeTicket = get("resumeTicket");

  const socket = useSocketContext();

  const { key: assistKey } = useParams<{ key?: string }>() || {};
  const { data: settings } = useGetAssistSettingsQuery(
    {
      assistKey: assistKey!,
    },
    { skip: !assistKey }
  );

  const [viewChatbox, setViewChatbox] = useState<boolean>(false);

  const [selectedTicket, setSelectedTicket] = useState<Omit<
    ITicket,
    "messages"
  > | null>(null);

  const handleSetSelectedTicket = (ticket: Omit<ITicket, "messages">) => {
    setSelectedTicket(ticket);
    setViewChatbox(true);
  };
  const toggleViewChatbox = () => {
    setViewChatbox(prev => !prev);
    setSelectedTicket(null);
  };

  const [typingTickets, setTypingTickets] = useState<
    {
      chatId: string;
      sender: string;
    }[]
  >([]);

  useEffect(() => {
    if (!socket) return;

    const handleTypingReceived = ({
      chatId,
      sender,
    }: {
      chatId: string;
      sender: string;
    }) => {
      if (typingTickets.find(ticket => ticket.chatId === chatId) === undefined)
        setTypingTickets(prev => [...prev, { chatId, sender }]);
    };

    const handleStopTypingReceived = ({
      chatId,
    }: {
      chatId: string;
      sender: string;
    }) => {
      setTypingTickets(prev => prev.filter(ticket => ticket.chatId !== chatId));
    };

    socket.on("typingReceived", handleTypingReceived);
    socket.on("stopTypingReceived", handleStopTypingReceived);

    return () => {
      if (!socket) return;

      socket.off("typingReceived");
      socket.off("stopTypingReceived");
    };
  }, [socket]);

  return (
    <>
      <Head>
        <title>Support Chat Widget</title>
      </Head>
      <div className="h-screen w-screen bg-white font-sans box-border">
        {resumeTicket ? (
          <div className="h-full w-full flex flex-col overflow-hidden">
            <ResumeTicketChatbox
              isTyping={
                !!typingTickets.find(
                  tTicket =>
                    tTicket.chatId === selectedTicket?._id &&
                    tTicket.sender !== visitorId
                )
              }
              settings={settings}
            />
          </div>
        ) : (
          <div className="h-full w-full flex flex-col overflow-hidden">
            {!viewChatbox ? (
              <Tickets
                settings={settings}
                typingTickets={typingTickets}
                onHandleAddNewMessage={toggleViewChatbox}
                onHandleSetSelectedTicket={handleSetSelectedTicket}
              />
            ) : (
              <Chatbox
                settings={settings}
                ticket={selectedTicket}
                setTicket={setSelectedTicket}
                viewChatbox={viewChatbox}
                isTyping={
                  !!typingTickets.find(
                    tTicket =>
                      tTicket.chatId === selectedTicket?._id &&
                      tTicket.sender !== visitorId
                  )
                }
                onHandleBack={toggleViewChatbox}
              />
            )}
          </div>
        )}
      </div>
    </>
  );
};

Widget.getLayout = (page: JSX.Element) => {
  const { assistKey, visitorId } = page.props;
  return (
    <SocketConnection namespace={assistKey} userId={visitorId}>
      {page}
    </SocketConnection>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { key = [] } = context.params as { key: string[] };
  const { visitorId: queryVisitorId, resumeTicket } = context.query;
  let visitorId = queryVisitorId;
  if (resumeTicket) {
    try {
      const response = await axios.get(
        `${baseUrl}/visitors/tickets/${resumeTicket}/visitor`
      );
      visitorId = response.data?.data?.visitorId;
    } catch (error) {}
  }

  return { props: { assistKey: key?.at(0) ?? "", visitorId } };
};
export default Widget;
