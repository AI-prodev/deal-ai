import React, { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";

interface ErrorModalProps {
  open: boolean;
  onClose: () => void;
  onRetry: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ open, onClose, onRetry }) => {
  return (
    <div className="mb-5">
      <Transition appear show={open} as={Fragment}>
        <Dialog as="div" open={open} onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0" />
          </Transition.Child>
          <div className="fixed inset-0 z-[999] overflow-y-auto bg-[black]/60">
            <div className="flex min-h-screen items-start justify-center px-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel
                  as="div"
                  className="panel my-8 w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark"
                >
                  <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                    <div className="text-lg font-bold">Socrates Error</div>
                    <button
                      type="button"
                      className="text-white-dark hover:text-dark"
                      onClick={onClose}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                  <div className="p-5">
                    <p className="py-3">
                      On this occasion, it was not possible to generate your
                      theses. As alpha software, this sometimes happens, please
                      accept our apologies!
                    </p>
                    <p className="py-3">
                      We have automatically notified our development team, and
                      they'll get to work on fixing it right away.
                    </p>
                    <p className="py-3">Let's try again!</p>
                    <div className="mt-8 flex items-center justify-end">
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={onRetry}
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default ErrorModal;
