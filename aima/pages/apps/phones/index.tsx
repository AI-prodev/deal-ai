import { CloudSVG, PhoneSVG, PlusSVG } from "@/components/icons/SVGData";
import PhoneCallItem from "@/components/phones/PhoneCallItem";
import PhoneCallItemMobile from "@/components/phones/PhoneCallItemMobile";
import PhoneNumberModal from "@/components/phones/PhoneNumberModal";
import withAuth from "@/helpers/withAuth";
import { IPhoneCall } from "@/interfaces/IPhoneCall";
import { IPhoneNumber } from "@/interfaces/IPhoneNumber";
import { createPhoneAPI } from "@/store/features/phoneApi";
import { USER_ROLES } from "@/utils/roles";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import { createStripeApi } from "@/store/features/stripeApi";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const CALL_LIMIT = 10;

const Phones = () => {
  const IS_LIGHT_MODE = true;

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const [isPhoneNumberModalOpen, setIsPhoneNumberModalOpen] = useState(false);
  const [editPhoneNumber, setEditPhoneNumber] = useState<
    IPhoneNumber | undefined
  >(undefined);
  const [offsetCallId, setOffsetCallId] = useState<string>("");
  const [phoneCalls, setPhoneCalls] = useState<IPhoneCall[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const { data: config } = createStripeApi.useGetConfigQuery({});
  const [stripe, setStripe] = useState<any | null>(null);

  const {
    data: phoneNumbers,
    refetch: refetchNumbers,
    isLoading: isLoadingPhoneNumbers,
  } = createPhoneAPI.useGetMyPhoneNumbersQuery({});
  const {
    data: fetchedPhoneCalls,
    isFetching: isFetchingCalls,
    isLoading: isLoadingCalls,
  } = createPhoneAPI.useGetMyPhoneCallsQuery({
    limit: CALL_LIMIT,
    offsetCallId,
  });

  useEffect(() => {
    if (!config) {
      return;
    }
    loadStripe(config.publicKey)
      .then(stripe => {
        setStripe(stripe);
      })
      .catch(err => {
        console.error(err);
      });
  }, [config]);

  useEffect(() => {
    if (fetchedPhoneCalls) {
      setPhoneCalls(prevNumbers => [
        ...prevNumbers,
        ...fetchedPhoneCalls.filter(
          c => !prevNumbers.find(p => p._id === c._id)
        ),
      ]);
      if (fetchedPhoneCalls.length < CALL_LIMIT) {
        setHasMore(false);
      }
    }
  }, [fetchedPhoneCalls]);

  const handleLoadMore = () => {
    setOffsetCallId(phoneCalls ? phoneCalls[phoneCalls.length - 1]._id : "");
  };

  const handlePhoneNumberModalOpen = ({
    phoneNumber,
  }: {
    phoneNumber?: IPhoneNumber;
  }) => {
    setEditPhoneNumber(phoneNumber);
    setIsPhoneNumberModalOpen(true);
  };

  const handlePhoneNumberModalClose = () => {
    setIsPhoneNumberModalOpen(false);
  };

  if (!isClient) {
    return <></>;
  }

  return (
    <div className="relative px-0 md:px-3 w-full flex justify-center">
      {IS_LIGHT_MODE && (
        <Head>
          <title>Business Phone</title>
          <style>
            {`
                            body {
                                background-color: white !important;
                            }
                        `}
          </style>
        </Head>
      )}
      <Elements stripe={stripe}>
        <PhoneNumberModal
          existingPhoneNumber={editPhoneNumber}
          isOpen={isPhoneNumberModalOpen}
          onRequestClose={handlePhoneNumberModalClose}
          onPhoneNumberCreated={refetchNumbers}
          onPhoneNumberUpdated={refetchNumbers}
          onPhoneNumberReleased={refetchNumbers}
        />
      </Elements>
      <div className="w-full max-w-3xl">
        <div className="flex flex-col md:flex-row items-center pt-2 w-full justify-between">
          <div className="flex flex-col justify-center items-center md:items-start">
            <div className="flex items-center">
              <PhoneSVG
                className={`h-6 w-6 ${IS_LIGHT_MODE && "text-black"}`}
              />
              <h2
                className={`ml-3 text-2xl font-bold ${IS_LIGHT_MODE && "text-black"}`}
              >
                Business Phone
              </h2>
            </div>
          </div>
        </div>
        {!isLoadingPhoneNumbers && phoneNumbers?.length === 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 w-full border border-transparent rounded-2xl overflow-hidden">
            <div className="p-6 py-12 flex flex-col items-start justify-center bg-gray-200">
              <h1 className="text-black text-xl font-extrabold">
                Get 1 phone number FREE with your deal.ai membership
              </h1>
              <h2 className="mt-4 text-black text-xs font-bold">
                Search numbers by area code
                <br />
                Have your business name in the greeting
                <br />
                Forward calls to up to 9 extensions
                <br />
                Call recordings saved to your Vault
                <br />
                <button
                  onClick={() =>
                    handlePhoneNumberModalOpen({
                      phoneNumber: undefined,
                    })
                  }
                  className="mt-4 rounded bg-primary px-4 py-2 text-white font-normal"
                >
                  + Phone Number
                </button>
              </h2>
            </div>
            <div
              className="min-h-48"
              style={{
                background:
                  "url(/assets/images/phone_banner.png) center / cover no-repeat",
              }}
            ></div>
          </div>
        )}
        <div className="mt-6">
          <div className="mb-8">
            <h2 className="text-xl mb-4 text-black">Your Phone Numbers</h2>
            <div className="bg-gray-100 p-4 rounded-lg text-black grid grid-cols-1 md:grid-cols-3 gap-4">
              {phoneNumbers?.map(phoneNumber => (
                <div
                  key={phoneNumber._id}
                  className="p-4 bg-white shadow rounded-md hover:shadow-md cursor-pointer"
                  onClick={() =>
                    handlePhoneNumberModalOpen({
                      phoneNumber,
                    })
                  }
                >
                  <h2 className="font-bold">{phoneNumber.title}</h2>
                  <h2 className="text-lg mt-1">
                    {phoneNumber.numberFormatted}
                  </h2>
                  <h2 className="mt-1">
                    {phoneNumber.extensions.length} Extension
                    {phoneNumber.extensions.length !== 1 && "s"}
                  </h2>
                </div>
              ))}
              <div
                className="relative p-4 bg-white shadow rounded-md hover:shadow-md cursor-pointer"
                onClick={() =>
                  handlePhoneNumberModalOpen({
                    phoneNumber: undefined,
                  })
                }
              >
                <div className="absolute inset-0 bg-white rounded-md flex flex-col justify-center items-center">
                  <PlusSVG className="h-4 w-4 mb-0.5" strokeWidth={2} />
                  <div className="">New</div>
                </div>
                <h2 className="font-bold">Number name</h2>
                Phone number
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-xl mb-4 text-black">Call List</h2>
            <div className="overflow-x-auto">
              {isMobile && (
                <div className="bg-gray-100 rounded-lg p-4">
                  {phoneCalls?.map(phoneCall => (
                    <PhoneCallItemMobile
                      key={phoneCall._id}
                      phoneCall={phoneCall}
                    />
                  ))}
                </div>
              )}
              {!isMobile && (
                <table className="table-auto w-full">
                  <thead>
                    <tr className="text-black bg-[#eeeeee]">
                      <th className="px-4 py-2 bg-[#eeeeee]">Date</th>
                      <th className="px-4 py-2 bg-[#eeeeee]">Duration</th>
                      <th className="px-4 py-2 bg-[#eeeeee]">Caller ID</th>
                      <th className="px-4 py-2 bg-[#eeeeee]">Call To</th>
                      <th className="px-4 py-2 bg-[#eeeeee]">Recording</th>
                    </tr>
                  </thead>
                  <tbody>
                    {phoneCalls?.map(phoneCall => (
                      <PhoneCallItem
                        key={phoneCall._id}
                        phoneCall={phoneCall}
                      />
                    ))}
                  </tbody>
                </table>
              )}
              {phoneCalls.length > 0 && hasMore && (
                <div className="w-full flex items-center justify-center mt-6">
                  <button
                    className="rounded border border-primary bg-white px-3 py-1 text-primary text-sm"
                    onClick={handleLoadMore}
                  >
                    {isFetchingCalls ? "Loading..." : "Load More"}
                  </button>
                </div>
              )}
              {!isLoadingCalls &&
                !isFetchingCalls &&
                phoneCalls &&
                phoneCalls.length === 0 && (
                  <div className="w-full my-12 flex flex-col items-center justify-center text-gray-400">
                    <CloudSVG
                      className="h-16 w-16 text-gray-300"
                      strokeWidth={2}
                    />
                    <h2>No calls yet</h2>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(Phones, USER_ROLES, "ai-platform");
