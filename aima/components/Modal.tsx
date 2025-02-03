import React, { FC } from "react";
import { Dialog, Transition } from "@headlessui/react";
import PerfectScrollbar from "react-perfect-scrollbar";
interface ModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  children?: React.ReactNode;
  customClassName?: string;
}

const Modal: FC<ModalProps> = ({
  isOpen,
  onRequestClose,
  children,
  customClassName,
}) => {
  const scrollbarClassName = `relative my-10 inline-block transform overflow-auto rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all dark:bg-[#1b2e4b] sm:my-8 sm:max-h-[476px] sm:w-full sm:max-w-xl sm:p-6 sm:align-middle ${customClassName}`;
  return (
    <Transition.Root show={isOpen} as={React.Fragment}>
      <Dialog
        open={isOpen}
        onClose={onRequestClose}
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto"
      >
        <div className="flex min-h-screen  items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <span
            className="hidden sm:inline-block sm:h-screen sm:align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>

          <PerfectScrollbar className={scrollbarClassName}>
            {children}
          </PerfectScrollbar>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default Modal;
