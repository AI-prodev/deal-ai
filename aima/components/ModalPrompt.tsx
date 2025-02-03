import React, { FC } from "react";
import { Dialog, Transition } from "@headlessui/react";
import PerfectScrollbar from "react-perfect-scrollbar";
interface ModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  children?: React.ReactNode;
  customClassName?: string;
  customSideModalClassName?: string;
  profiles: any;
}

const ModalPrompt: FC<ModalProps> = ({
  isOpen,
  onRequestClose,
  children,
  profiles,
  customClassName,
  customSideModalClassName,
}) => {
  const scrollbarClassName = `relative mx-10 my-10 inline-block transform rounded-lg bg-white !pl-4 !pr-0 pt-5 pb-4 text-left align-bottom shadow-xl transition-all dark:bg-[#1b2e4b] sm:my-8  w-3/5 sm:w-full sm:p-6 sm:align-middle ${customClassName}`;
  const scrollbar2ClassName = `relative mx-10 my-10 inline-block transform rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all dark:bg-[#1b2e4b] sm:my-8 sm:min-w-96 sm:p-6 sm:align-middle ${customSideModalClassName}`;
  return (
    <Transition.Root show={isOpen} as={React.Fragment}>
      <Dialog
        open={isOpen}
        onClose={onRequestClose}
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto"
      >
        <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-left sm:p-0">
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-0"
            leave="ease-in duration-200"
            leaveFrom="opacity-10"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <span
            className=" sm:inline-block sm:h-screen sm:align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>

          <div className={scrollbarClassName}>
            <PerfectScrollbar
              className="!overflow-hidden overflow-auto max-h-[680px] promptModal pr-4"
              style={{ direction: "rtl" }}
            >
              <div style={{ direction: "ltr" }}>{children}</div>
            </PerfectScrollbar>
          </div>
          {profiles && (
            <div className={scrollbar2ClassName}>
              {
                <PerfectScrollbar className="!overflow-hidden overflow-auto h-[680px]">
                  {profiles}
                </PerfectScrollbar>
              }
            </div>
          )}
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default ModalPrompt;
