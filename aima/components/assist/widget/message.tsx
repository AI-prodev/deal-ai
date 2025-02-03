import {
  IAssistSettings,
  IMessage,
  ITicket,
  IVisitor,
  MessageTypeEnum,
} from "@/interfaces/ITicket";
import { IUser } from "@/interfaces/IUser";
import { getAvatarBgColorFromLetters } from "../../../helpers/assistHelpers";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@mantine/core";
import { useUpdateVisitorDataMutation } from "@/store/features/assistApi";
import { useParams } from "next/navigation";
import { useSearchParam } from "react-use";
import { useSocketContext } from "@/contexts/SocketConnection";

const validationSchema = Yup.object().shape({
  name: Yup.string().required().label("Name"),
  email: Yup.string().email().required().label("Email"),
});

interface MessageProps {
  message: IMessage;
  ticketId?: string;
  visitor?: IVisitor;
  settings?: IAssistSettings;
  setTicket?: React.Dispatch<
    React.SetStateAction<Omit<ITicket, "messages"> | null>
  >;
}

const Message = ({
  ticketId,
  message,
  visitor,
  settings,
  setTicket,
}: MessageProps) => {
  const socket = useSocketContext();
  const [updateVisitorData] = useUpdateVisitorDataMutation();
  const { key: assistKey } = useParams<{ key?: string }>() || {};
  const visitorId = useSearchParam("visitorId")!;

  const onHandleSubmit = async (values: { name: string; email: string }) => {
    const { data } = await updateVisitorData({
      query: { assistKey: assistKey!, visitorId },
      body: values,
      id: ticketId!,
    }).unwrap();
    socket?.emit("updateVisitorData", { chatId: ticketId!, data });
    setTicket && setTicket(prev => ({ ...prev, ...data }));
  };

  const { values, errors, handleChange, handleSubmit } = useFormik({
    initialValues: {
      name: visitor?.name ?? "",
      email: visitor?.email ?? "",
    },
    validateOnBlur: true,
    onSubmit: onHandleSubmit,
    validationSchema,
  });

  const isRtl =
    !(
      message?.sentBy &&
      typeof message.sentBy === "object" &&
      "firstName" in message.sentBy
    ) && !message.isBot;

  const getAvatarData = (message: IMessage) => {
    const firstLetterFromTitle =
      (message?.sentBy as IUser)?.firstName?.at(0) ??
      (message.sentBy as IVisitor)?.name?.at(0);
    const avatarBgColor = getAvatarBgColorFromLetters(firstLetterFromTitle);

    return {
      avatarBgColor,
      firstLetterFromTitle,
    };
  };

  const handleViewImage = (image: string) => {
    window.parent.postMessage(
      { eventName: "image-modal", open: true, src: image },
      "*"
    );
  };
  return (
    <div
      className={`w-full flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}
    >
      {!isRtl && !message.isBot && (
        <div
          className={`w-10 h-10 bg-${getAvatarData(message).avatarBgColor} text-white rounded-full text-xs flex items-center justify-center self-end`}
        >
          {getAvatarData(message).firstLetterFromTitle}
        </div>
      )}
      {message.isBot && (
        <img
          className={`w-10 h-10 text-white rounded-full text-xs flex items-center justify-center self-end`}
          src={"/assets/assist/chatbot.svg"}
        />
      )}
      <div
        className={`flex flex-col gap-3 ${isRtl ? "max-w-[80%]" : message.isBot ? "max-w-[100%]" : "max-w-[60%]"}`}
      >
        <span
          className={`py-4 px-5 flex flex-col gap-2 rounded-[10px] text-sm break-words`}
          style={{
            backgroundColor: isRtl ? settings?.color : "#F2F2F2",
            color: isRtl ? "white" : "black",
          }}
        >
          {message.type === MessageTypeEnum.TEXT ? (
            <>
              {message.message}
              {message.isBot &&
                (visitor?.email ? (
                  <>
                    <span className="text-black/70">Name: {visitor?.name}</span>
                    <span className="text-black/70">
                      Email: {visitor?.email}
                    </span>
                  </>
                ) : (
                  <form
                    className="p-5 flex flex-col gap-2 border border-gray-300 text-sm rounded-xl"
                    onSubmit={handleSubmit}
                  >
                    <span>Get notified by email</span>
                    <input
                      name={"name"}
                      placeholder="name"
                      value={values.name}
                      onChange={handleChange}
                      className={`w-full rounded p-2 border-2 text-sm ${errors.name ? "border-danger outline-danger" : "outline-primary"}`}
                    />

                    <input
                      name={"email"}
                      placeholder="email@example.com"
                      value={values.email}
                      onChange={handleChange}
                      className={`w-full rounded p-2 border-2 text-sm ${errors.email ? "border-danger outline-danger" : "outline-primary"}`}
                    />
                    <Button
                      type="submit"
                      disabled={!values.name || !values.email}
                      className="bg-primary hover:bg-primary/80 text-sm h-8"
                    >
                      Save
                    </Button>
                  </form>
                ))}
            </>
          ) : (
            <>
              {message?.images?.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  width={"300px"}
                  height={"300px"}
                  className="cursor-zoom-in"
                  onClick={() => handleViewImage(img)}
                ></img>
              ))}
            </>
          )}
        </span>
      </div>
    </div>
  );
};

export default Message;
