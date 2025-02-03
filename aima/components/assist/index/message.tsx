import { IMessage, IVisitor, MessageTypeEnum } from "@/interfaces/ITicket";
import moment from "moment";
import { getAvatarBgColorFromLetters } from "../../../helpers/assistHelpers";
import { IUser } from "@/interfaces/IUser";
import clsx from "clsx";
import ImageModal from "../modals/imageModal";
import { useState } from "react";

const CreatedAt = ({
  isRtl,
  createdAt,
}: {
  isRtl: boolean;
  createdAt?: Date;
}) => {
  return (
    <div
      className={clsx("flex gap-1 items-center", {
        "ml-auto": isRtl,
      })}
    >
      <img
        alt={"chatbubble"}
        src="/assets/assist/chat.svg"
        style={{ filter: isRtl ? "invert(1)" : "" }}
      />
      <span>{moment(createdAt).fromNow()}</span>
    </div>
  );
};

interface MessageProps {
  message: IMessage;
  visitor?: IVisitor;
  isFirstMessageInARow: boolean;
  isLastMessageInARow: boolean;
}

const Message = ({
  message,
  visitor,
  isFirstMessageInARow,
  isLastMessageInARow,
}: MessageProps) => {
  const [imageModal, setImageModal] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string>("");

  const isRtl =
    message?.sentBy &&
    typeof message.sentBy === "object" &&
    "firstName" in message.sentBy &&
    !message.isBot;

  // const boxBorder = isRtl
  //   ? isFirstMessageInARow ? "rounded-tr-2xl rounded-l-2xl" : isLastMessageInARow ? "rounded-br-2xl rounded-l-2xl" : "rounded-tl-2xl rounded-bl-2xl"
  //   : isFirstMessageInARow ? "rounded-tl-2xl rounded-r-2xl" : isLastMessageInARow ? "rounded-bl-2xl rounded-r-2xl" : "rounded-tr-2xl rounded-br-2xl";

  const boxBorder = clsx({
    // Top right & top left
    "rounded-tr-2xl":
      (isRtl && isFirstMessageInARow) || (!isRtl && !isLastMessageInARow),
    "rounded-tl-2xl":
      (isRtl && !isLastMessageInARow) || (!isRtl && isFirstMessageInARow),

    // Bottom right & bottom left
    "rounded-br-2xl":
      (isRtl && isLastMessageInARow) || (!isRtl && !isLastMessageInARow),
    "rounded-bl-2xl": isRtl
      ? !isLastMessageInARow && !isFirstMessageInARow
      : !isFirstMessageInARow && isLastMessageInARow,

    // Right & left
    "rounded-r-2xl":
      (!isRtl && isFirstMessageInARow) || (!isRtl && isLastMessageInARow),
    "rounded-l-2xl":
      (isRtl && isFirstMessageInARow) || (isRtl && isLastMessageInARow),
  });

  const getAvatarData = (message: IMessage) => {
    const firstLetterFromTitle = (
      (message?.sentBy as IUser)?.firstName?.at(0) ??
      (message.sentBy as IVisitor)?.name?.at(0)
    )?.toUpperCase();
    const avatarBgColor = getAvatarBgColorFromLetters(firstLetterFromTitle);

    return {
      avatarBgColor,
      firstLetterFromTitle,
    };
  };

  const handleToggleImageModal = () => setImageModal(prev => !prev);
  const handleViewImage = (image: string) => {
    setSelectedImage(image);
    handleToggleImageModal();
  };

  const { email, name } = visitor || {};

  return (
    <div
      className={clsx(
        "flex",
        "gap-2",
        "items-end",
        isRtl && "flex-row-reverse"
      )}
    >
      {/* Avatar */}
      {!message.isBot ? (
        <div
          className={`w-6 h-6 bg-${getAvatarData(message).avatarBgColor} rounded-xl text-xs flex items-center justify-center text-white`}
        >
          {getAvatarData(message).firstLetterFromTitle}
        </div>
      ) : (
        <img
          className={`w-6 h-10 text-white rounded-full text-xs flex items-center justify-center self-end`}
          src={"/assets/assist/chatbot.svg"}
        />
      )}

      <div
        className={`flex flex-col gap-3 ${isRtl ? "max-w-[80%]" : message.isBot ? "max-w-[100%]" : "max-w-[60%]"}`}
      >
        <div
          className={`flex flex-col gap-1 ${boxBorder} p-3 break-words ${message.isBot ? "bg-[#F2f2f2] text-black" : isRtl ? "bg-primary text-white" : "bg-[#F2f2f2] text-black"}`}
        >
          {message.type === MessageTypeEnum.TEXT ? (
            <>
              {message.message}
              {message.isBot && email && (
                <>
                  <span className="text-black/70">Name: {name}</span>
                  <span className="text-black/70">Email: {email}</span>
                </>
              )}
              {isLastMessageInARow && (
                <CreatedAt isRtl={isRtl!} createdAt={message.createdAt} />
              )}
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
        </div>
      </div>
      <ImageModal
        open={imageModal}
        onClose={handleToggleImageModal}
        image={selectedImage}
      />
    </div>
  );
};

export default Message;
