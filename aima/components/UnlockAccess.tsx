import Link from "next/link";
import React from "react";

interface UnlockAccessUIProps {
  onUnlock: () => void;
  isProcessingPayment: boolean;
}

const UnlockAccessUI: React.FC<UnlockAccessUIProps> = ({
  onUnlock,
  isProcessingPayment,
}) => {
  return (
    <div className="fixed inset-0 z-10 top-14 flex justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-75 backdrop-blur-sm"></div>

      <div className="relative z-20 mt-16 h-48 min-h-fit scale-105 transform rounded-lg p-8 text-white shadow-xl transition duration-500 md:mt-24 lg:mt-32">
        <h2 className="mb-4 text-center text-3xl font-bold">Locked 🔒</h2>
        <div className="inline-block">
          <div className="flex flex-col space-y-4">
            {isProcessingPayment ? (
              <h2 className="mt-4 text-center text-lg font-bold">
                Please wait...
              </h2>
            ) : (
              <button
                onClick={onUnlock}
                className="w-full rounded-full bg-blue-500 px-8 py-3 text-lg font-medium transition-colors hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300"
              >
                Unlock Access
              </button>
            )}
            {/* <Link href="/apps/settings/manage">
                            <button className="w-full rounded-full bg-blue-500 px-8 py-3 text-lg font-medium transition-colors hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300">
                                Manage Subscription
                            </button>
                        </Link> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnlockAccessUI;
