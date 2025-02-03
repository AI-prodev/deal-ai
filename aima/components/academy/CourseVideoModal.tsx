import Modal from "@/components/Modal";
import { isMobile } from "react-device-detect";
import VimeoOverlay from "./CourseVideoMobile";

export type CourseVideoModalProps = {
  vimeoId: string;
  title: string;
  isOpen: boolean;
  onRequestClose: () => void;
};

const CourseVideoModal: React.FC<CourseVideoModalProps> = ({
  vimeoId,
  title,
  isOpen,
  onRequestClose,
}) => {
  if (isMobile) {
    return (
      <VimeoOverlay
        title={title}
        vimeoId={vimeoId}
        isOpen={isOpen}
        onRequestClose={onRequestClose}
      />
    );
  }

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
      <div className="grid grid-rows-[auto_1fr] h-full">
        <div>
          <h2 className="mb-4 text-lg font-bold text-white">{title}</h2>
        </div>

        <div className="h-full grid grid-rows-[auto_1fr] overflow-hidden">
          <div className="space-y-4">
            <div
              style={{
                padding: "52.59% 0 0 0",
                position: "relative",
              }}
            >
              <iframe
                src={`https://player.vimeo.com/video/${vimeoId}?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479`}
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                }}
                title={title}
              ></iframe>
            </div>
            <script src="https://player.vimeo.com/api/player.js"></script>
          </div>
        </div>

        <div className={`mt-4 flex justify-end`}>
          <button
            type="button"
            onClick={onRequestClose}
            className="mr-2 rounded border border-primary px-4 py-2 text-primary"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CourseVideoModal;
