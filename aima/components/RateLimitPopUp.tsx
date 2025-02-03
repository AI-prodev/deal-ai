import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useSelector, useDispatch } from "react-redux";
import { setShow } from "../store/features/rateLimitSlice";
import { useRouter } from "next/router";

const RateLimitPopUp: React.FC = () => {
  const dispatch = useDispatch();
  const rateLimit = useSelector((state: any) => state.rateLimit);
  const router = useRouter();
  const onClose = () => {
    dispatch(setShow({ show: false }));
  };

  const onGoHome = () => {
    router.push("/apps/contact-us");
    onClose();
  };

  return (
    <>
      <Transition appear show={rateLimit.show} as={Fragment}>
        <Dialog as="div" static open={rateLimit.show} onClose={onClose}>
          {" "}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0" onClick={onGoHome} />
          </Transition.Child>
          <div
            className="fixed inset-0 z-[999] overflow-y-auto bg-[black]/60"
            onClick={onGoHome}
          >
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
                    <div className="text-lg font-bold">Limit Reached</div>
                    {/* <button
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
                    </button> */}
                  </div>
                  <div className="p-5">
                    <p className="py-3">
                      Contact{" "}
                      <a
                        href="mailto:support@deal.ai"
                        className="text-blue-500"
                      >
                        support@deal.ai
                      </a>{" "}
                      to upgrade for unlimited access, or come back in 24 hours.
                    </p>

                    <div className="mt-8 flex items-center justify-end">
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={onGoHome}
                      >
                        Back
                      </button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default RateLimitPopUp;
