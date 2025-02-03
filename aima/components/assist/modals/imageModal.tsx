import React from "react";
import { Dialog } from "@headlessui/react";

interface ImageModalProps {
  image: string;
  open: boolean;
  onClose: VoidFunction;
}

const ImageModal = ({ open, image, onClose }: ImageModalProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="fixed inset-0 z-10 cursor-zoom-out"
    >
      <div className="flex min-h-screen items-center justify-center p-2">
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />

        <div
          style={{ backgroundImage: `url('${image}')` }}
          onClick={onClose}
          className={`w-full sm:w-[70%] cursor-zoom-out md:w-[50%] h-screen sm:h-[80vh] md:h-[70vh] bg-opacity-100 relative bg-no-repeat bg-center bg-contain`}
        />
      </div>
    </Dialog>
  );
};

export default ImageModal;
