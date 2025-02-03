import ImageModal from "@/components/assist/modals/imageModal";
import Head from "next/head";
import { useEffect, useState } from "react";

interface WidgetImageModalProps {}

const WidgetImageModal = ({}: WidgetImageModalProps) => {
  const [image, setImage] = useState<string>("");

  const handleClickAway = () => {
    window.parent.postMessage({ eventName: "image-modal", open: false }, "*");
  };

  useEffect(() => {
    const handleMessageEvent = (event: MessageEvent) => {
      if (event.data?.eventName === "image-modal") {
        setImage(event.data?.src);
      }
    };
    window.addEventListener("message", handleMessageEvent);
    return () => {
      window.removeEventListener("message", handleMessageEvent);
    };
  }, []);

  return (
    <>
      <Head>
        <title>Support Chat Modal</title>

        <style>{`
              body { 
                background-color: transparent !important;
              }`}</style>
      </Head>

      <ImageModal open onClose={handleClickAway} image={image} />
    </>
  );
};

WidgetImageModal.getLayout = (page: JSX.Element) => {
  return <>{page}</>;
};

export default WidgetImageModal;
