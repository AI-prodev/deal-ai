import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Chatbox from "@/components/assist/index/chatbox";
import Tickets from "@/components/assist/index/tickets";
import CodeSnippetModal from "@/components/assist/modals/codeSnippetModal";
import SettingsModal from "@/components/assist/modals/settingsModal";
import SocketConnection from "@/contexts/SocketConnection";
import withAuth from "@/helpers/withAuth";
import { ITicket } from "@/interfaces/ITicket";
import {
  useGenerateAssistKeyMutation,
  useGetAssistKeyQuery,
  useGetAssistSettingsQuery,
} from "@/store/features/assistApi";
import { baseUrl } from "@/utils/baseUrl";
import { USER_ROLES } from "@/utils/roles";
import { Button } from "@mantine/core";
import axios from "axios";
import clsx from "clsx";
import { GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";
import Head from "next/head";
import { useEffect, useState } from "react";

interface AssistProps {}

const Assist = ({}: AssistProps) => {
  const [generateAssistKey] = useGenerateAssistKeyMutation();
  const { data, isSuccess, refetch } = useGetAssistKeyQuery({});

  const [codeSnippetModal, setCodeSnippetModal] = useState<boolean>(false);
  const [settingsModal, setSettingsModal] = useState<boolean>(false);

  const [isChatboxLoading, setIsChatboxLoading] = useState<boolean>(false);
  const [selectedTicket, setSelectedTicket] = useState<Omit<
    ITicket,
    "messages"
  > | null>(null);

  const { data: settings } = useGetAssistSettingsQuery(
    {
      assistKey: data?.assistKey!,
    },
    { skip: !data?.assistKey }
  );

  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  const toggleCodeSnippetModal = () => setCodeSnippetModal(prev => !prev);
  const toggleSettingsModal = () => setSettingsModal(prev => !prev);
  const toggleDrawer = () => setDrawerOpen(prev => !prev);

  useEffect(() => {
    if (!data?.assistKey && isSuccess) {
      generateAssistKey({});
      refetch();
    }
  }, [data?.assistKey, isSuccess]);

  if (!data?.assistKey) return <></>;

  return (
    <div className="-mb-6 h-[calc(100vh-240px)]">
      <Head>
        <title>Support Chat</title>
        <style>
          {`
                        body { background-color: white !important;}
                        ::-webkit-scrollbar {
                            width: 8px;
                        }

                        ::-webkit-scrollbar-track {
                            background: #f1f1f1;
                        }

                        ::-webkit-scrollbar-thumb {
                            background: #888;
                            border-radius: 20px;
                        }

                        ::-webkit-scrollbar-thumb:hover {
                            background: #555;
                        }
                    `}
        </style>
      </Head>
      <div className="flex flex-col gap-2 divide-y-[2.5px] divide-[#ebedf2]">
        <div className="flex gap-2 ml-auto">
          <Button
            onClick={toggleCodeSnippetModal}
            variant="filled"
            className="bg-black/70 hover:bg-black/50 rounded-lg text-[10px] md:text-sm"
          >
            Code Snippet
          </Button>
          <Button
            onClick={toggleSettingsModal}
            variant="filled"
            className="bg-black/70 hover:bg-black/50 rounded-lg"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 md:w-6 md:h-6"
            >
              <path
                d="M11.9889 16.4125C9.68039 16.4125 7.80679 14.4343 7.80679 11.9969C7.80679 9.55939 9.68039 7.58116 11.9889 7.58116C14.2975 7.58116 16.1711 9.55939 16.1711 11.9969C16.1711 14.4343 14.2975 16.4125 11.9889 16.4125ZM11.9889 9.34744C10.606 9.34744 9.47965 10.5367 9.47965 11.9969C9.47965 13.457 10.606 14.6463 11.9889 14.6463C13.3718 14.6463 14.4982 13.457 14.4982 11.9969C14.4982 10.5367 13.3718 9.34744 11.9889 9.34744Z"
                fill="white"
              />
              <path
                d="M15.5685 23.9955C15.3343 23.9955 15.1001 23.9602 14.8659 23.9013C14.1745 23.7011 13.5946 23.2419 13.2265 22.5943L13.0927 22.3588C12.4347 21.1577 11.5314 21.1577 10.8734 22.3588L10.7507 22.5825C10.3827 23.2419 9.80273 23.7129 9.11128 23.9013C8.40868 24.1015 7.68377 23.9955 7.07039 23.6069L5.15217 22.4412C4.47187 22.0291 3.98117 21.3579 3.76927 20.5454C3.56853 19.7329 3.6689 18.8969 4.05924 18.1786C4.38266 17.578 4.47188 17.0364 4.28228 16.6949C4.09269 16.3534 3.61314 16.1532 2.95515 16.1532C1.32689 16.1532 -0.000244141 14.752 -0.000244141 13.0328V10.9604C-0.000244141 9.24121 1.32689 7.83997 2.95515 7.83997C3.61314 7.83997 4.09269 7.63979 4.28228 7.29831C4.47188 6.95683 4.39381 6.41517 4.05924 5.81463C3.6689 5.09635 3.56853 4.24854 3.76927 3.44782C3.97002 2.63534 4.46072 1.96415 5.15217 1.55202L7.08154 0.386279C8.34176 -0.402657 10.0035 0.0565745 10.7618 1.41072L10.8957 1.64622C11.5537 2.84729 12.457 2.84729 13.115 1.64622L13.2377 1.42249C13.996 0.0565745 15.6577 -0.402657 16.9291 0.398055L18.8473 1.5638C19.5276 1.97593 20.0183 2.64711 20.2302 3.4596C20.431 4.27209 20.3306 5.10812 19.9403 5.82641C19.6169 6.42694 19.5276 6.9686 19.7172 7.31008C19.9068 7.65156 20.3864 7.85174 21.0444 7.85174C22.6726 7.85174 23.9998 9.25299 23.9998 10.9722V13.0446C23.9998 14.7638 22.6726 16.165 21.0444 16.165C20.3864 16.165 19.9068 16.3652 19.7172 16.7067C19.5276 17.0482 19.6057 17.5898 19.9403 18.1903C20.3306 18.9086 20.4421 19.7564 20.2302 20.5572C20.0295 21.3696 19.5388 22.0408 18.8473 22.453L16.918 23.6187C16.4942 23.866 16.0369 23.9955 15.5685 23.9955ZM11.9886 19.6387C12.9812 19.6387 13.9068 20.2981 14.5425 21.4638L14.6652 21.6876C14.799 21.9348 15.0221 22.1115 15.2897 22.1821C15.5574 22.2528 15.825 22.2175 16.0481 22.0761L17.9775 20.8986C18.2674 20.722 18.4905 20.4276 18.5797 20.0744C18.6689 19.7211 18.6243 19.3561 18.457 19.0499C17.8213 17.896 17.7433 16.7067 18.234 15.8C18.7247 14.8933 19.7395 14.3752 21.0109 14.3752C21.7247 14.3752 22.2934 13.7747 22.2934 13.021V10.9486C22.2934 10.2068 21.7247 9.59447 21.0109 9.59447C19.7395 9.59447 18.7247 9.07636 18.234 8.16967C17.7433 7.26298 17.8213 6.07369 18.457 4.91972C18.6243 4.61357 18.6689 4.24854 18.5797 3.89528C18.4905 3.54203 18.2786 3.25942 17.9886 3.07102L16.0592 1.90528C15.5797 1.59912 14.944 1.77575 14.654 2.29386L14.5314 2.51759C13.8957 3.68333 12.97 4.34274 11.9775 4.34274C10.9849 4.34274 10.0592 3.68333 9.42355 2.51759L9.30087 2.28208C9.02206 1.78753 8.39753 1.6109 7.91797 1.90528L5.9886 3.08279C5.69864 3.25942 5.47559 3.5538 5.38637 3.90706C5.29715 4.26031 5.34176 4.62534 5.50905 4.9315C6.14474 6.08546 6.2228 7.27476 5.7321 8.18145C5.24139 9.08813 4.22652 9.60624 2.95515 9.60624C2.24139 9.60624 1.67262 10.2068 1.67262 10.9604V13.0328C1.67262 13.7747 2.24139 14.387 2.95515 14.387C4.22652 14.387 5.24139 14.9051 5.7321 15.8118C6.2228 16.7184 6.14474 17.9077 5.50905 19.0617C5.34176 19.3679 5.29715 19.7329 5.38637 20.0861C5.47559 20.4394 5.68749 20.722 5.97745 20.9104L7.90682 22.0761C8.14102 22.2292 8.41983 22.2646 8.67634 22.1939C8.94399 22.1233 9.16704 21.9348 9.31202 21.6876L9.4347 21.4638C10.0704 20.3099 10.996 19.6387 11.9886 19.6387Z"
                fill="white"
              />
            </svg>
          </Button>
        </div>
        <div className="flex relative h-[calc(100vh-275px)] divide-x-[2.5px] divide-[#ebedf2]">
          <span
            className={clsx(
              "absolute lg:hidden -left-6 top-[12px] transition-all w-max z-20 cursor-pointer bg-dark rounded-r-md p-1 flex items-center justify-center",
              { "opacity-0 w-0 delay-0": drawerOpen },
              {
                "delay-500": !drawerOpen,
              }
            )}
            onClick={toggleDrawer}
          >
            <img src={"/assets/assist/chevron-right.svg"} />
          </span>
          {/* Tickets List */}
          <Tickets
            selectedTicket={selectedTicket}
            setSelectedTicket={val => {
              setIsChatboxLoading(true);
              setSelectedTicket(val);
              setTimeout(() => {
                setIsChatboxLoading(false);
              }, 1000);
            }}
            assistKey={data?.assistKey}
            drawerOpen={drawerOpen}
            toggleDrawer={toggleDrawer}
            toggleCodeSnippetModal={toggleCodeSnippetModal}
          />

          {/* Chatbox */}
          <Chatbox
            settings={settings}
            ticket={selectedTicket}
            setTicket={setSelectedTicket}
            isChatboxLoading={isChatboxLoading}
          />
        </div>
      </div>
      <CodeSnippetModal
        open={codeSnippetModal}
        onClose={toggleCodeSnippetModal}
        assistKey={data?.assistKey!}
      />
      <SettingsModal
        open={settingsModal}
        onClose={toggleSettingsModal}
        assistKey={data?.assistKey!}
      />
    </div>
  );
};

Assist.getLayout = (page: JSX.Element) => {
  const { assistKey, userId } = page.props;
  return (
    <SocketConnection namespace={assistKey} userId={userId}>
      <DefaultLayout>{page}</DefaultLayout>
    </SocketConnection>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  try {
    const session = await getSession(context);
    const response = await axios.get(`${baseUrl}/tickets/key`, {
      headers: { Authorization: `Bearer ${session?.token}` },
    });
    const assistKey = response?.data?.assistKey;
    return { props: { assistKey, userId: session?.id } };
  } catch (error) {
    return { props: {} };
  }
};

export default withAuth(Assist, USER_ROLES, "ai-platform");
