import EmailUserList from "@/components/email/EmailUserList";
import NewEmailModal from "@/components/email/NewEmailModal";
import { EmailSVG } from "@/components/icons/SVGData";
import withAuth from "@/helpers/withAuth";
import { createEmailUserAPI } from "@/store/features/emailUserApi";
import { createStripeApi } from "@/store/features/stripeApi";
import { USER_ROLES } from "@/utils/roles";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Head from "next/head";
import React, { useEffect, useState } from "react";

const Email = () => {
  const IS_LIGHT_MODE = true;
  const { data: config } = createStripeApi.useGetConfigQuery({});
  const [stripe, setStripe] = useState<any | null>(null);
  const [isNewEmailModalOpen, setIsNewEmailModalOpen] = useState(false);
  const {
    data: emailUsers,
    refetch: refetchEmailUsers,
    isLoading: loadingEmailUsers,
  } = createEmailUserAPI.useGetMyEmailUsersQuery({});

  const handleNewEmailModalClose = () => {
    setIsNewEmailModalOpen(false);
  };

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

  return (
    <>
      <Head>
        <title>Email</title>
      </Head>
      <div className="relative px-0 md:px-3 w-full flex justify-center">
        {IS_LIGHT_MODE && (
          <Head>
            <title>Email</title>
            <style>
              {`
            body {
              background-color: white !important;
            }
          `}
            </style>
          </Head>
        )}
        <div className="w-full max-w-3xl">
          <div className="flex flex-col md:flex-row items-center pt-2 w-full justify-between">
            <div className="flex flex-col justify-center items-center md:items-start">
              <div className="flex items-center">
                <EmailSVG
                  className={`h-6 w-6 ${IS_LIGHT_MODE && "text-black"}`}
                />
                <h2
                  className={`ml-3 text-2xl font-bold ${IS_LIGHT_MODE && "text-black"}`}
                >
                  Email
                </h2>
                <h2 className="ml-2 text-sm font-bold text-blue-500 relative -top-2">
                  Beta
                </h2>
              </div>
            </div>
            <div className="mt-2 md:mt-0 min-w-72 flex justify-center md:justify-end">
              <button
                onClick={() => setIsNewEmailModalOpen(true)}
                className="rounded bg-primary px-4 py-2 text-white"
              >
                + Email Account
              </button>
            </div>
          </div>
          <div className="mt-3">
            {!loadingEmailUsers && emailUsers?.length === 0 && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 w-full border border-transparent rounded-2xl overflow-hidden">
                <div className="p-6 py-12 flex flex-col items-start justify-center bg-gray-200">
                  <h1 className="text-black text-xl font-extrabold">
                    Get 10 branded email accounts FREE with your deal.ai
                    membership
                  </h1>
                  <h2 className="mt-4 text-black text-xs font-bold">
                    Custom domains
                    <br />
                    15 GB of space per account
                    <br />
                    UI in over 80 languages
                    <br />
                    External SMTP/IMAP server
                    <br />
                    Light & Dark Mode
                    <br />
                    <button
                      onClick={() => setIsNewEmailModalOpen(true)}
                      className="mt-4 rounded bg-primary px-4 py-2 text-white font-normal"
                    >
                      + Email Account
                    </button>
                  </h2>
                </div>
                <div
                  className="min-h-48"
                  style={{
                    background:
                      "url(/assets/images/email_cube.webp) center / cover no-repeat",
                  }}
                ></div>
              </div>
            )}
            <EmailUserList
              emalUsers={emailUsers || []}
              onChange={refetchEmailUsers}
            />
          </div>
        </div>
        <Elements stripe={stripe}>
          <NewEmailModal
            isOpen={isNewEmailModalOpen}
            onRequestClose={handleNewEmailModalClose}
            onEmailCreated={refetchEmailUsers}
          />
        </Elements>
      </div>
    </>
  );
};

export default withAuth(Email, USER_ROLES, "ai-platform");
