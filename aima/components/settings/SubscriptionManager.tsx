import React from "react";
import LoadingSkeleton from "../apollo/LoadingSkeleton";

type Subscription = {
  roles: string[];
  portalUrl: string;
};

type Props = {
  subscriptions: Subscription[];
  isLoading?: boolean;
  error?: any;
};

const roleDisplayNames: { [key: string]: string } = {
  user: "AI Marketing Software Subscription",
  lite: "AI Marketing Software LITE Subscription",
  academy: "Academy Subscription",
  leads: "Leads for AI Agencies Subscription",
  "leads-max": "Leads Max for AI Agencies Subscription",
  "leads-pro": "Leads Elite for AI Agencies Subscription",
  mastermind: "Mastermind Subscription",
};

const SubscriptionCard: React.FC<{ role: string; portalUrl: string }> = ({
  role,
  portalUrl,
}) => {
  const displayName = roleDisplayNames[role] || role;

  return (
    <div className="bg-dark-600 flex flex-col rounded-lg shadow-lg transition-transform duration-300 hover:scale-105">
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-4 flex items-center space-x-4">
          <svg
            className="h-12 w-12"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M9.94358 3.25H14.0564C15.8942 3.24998 17.3498 3.24997 18.489 3.40314C19.6614 3.56076 20.6104 3.89288 21.3588 4.64124C22.1071 5.38961 22.4392 6.33856 22.5969 7.51098C22.6873 8.18385 22.7244 8.9671 22.7395 9.87428C22.7464 9.91516 22.75 9.95716 22.75 10C22.75 10.0353 22.7476 10.0699 22.7429 10.1039C22.75 10.6696 22.75 11.2818 22.75 11.9436V12.0564C22.75 13.8942 22.75 15.3498 22.5969 16.489C22.4392 17.6614 22.1071 18.6104 21.3588 19.3588C20.6104 20.1071 19.6614 20.4392 18.489 20.5969C17.3498 20.75 15.8942 20.75 14.0564 20.75H9.94359C8.10583 20.75 6.65019 20.75 5.51098 20.5969C4.33856 20.4392 3.38961 20.1071 2.64124 19.3588C1.89288 18.6104 1.56076 17.6614 1.40314 16.489C1.24997 15.3498 1.24998 13.8942 1.25 12.0564V11.9436C1.24999 11.2818 1.24999 10.6696 1.25714 10.1039C1.25243 10.0699 1.25 10.0352 1.25 10C1.25 9.95716 1.25359 9.91517 1.26049 9.87429C1.27564 8.96711 1.31267 8.18385 1.40314 7.51098C1.56076 6.33856 1.89288 5.38961 2.64124 4.64124C3.38961 3.89288 4.33856 3.56076 5.51098 3.40314C6.65019 3.24997 8.10582 3.24998 9.94358 3.25ZM2.75199 10.75C2.75009 11.1384 2.75 11.5541 2.75 12C2.75 13.9068 2.75159 15.2615 2.88976 16.2892C3.02502 17.2952 3.27869 17.8749 3.7019 18.2981C4.12511 18.7213 4.70476 18.975 5.71085 19.1102C6.73851 19.2484 8.09318 19.25 10 19.25H14C15.9068 19.25 17.2615 19.2484 18.2892 19.1102C19.2952 18.975 19.8749 18.7213 20.2981 18.2981C20.7213 17.8749 20.975 17.2952 21.1102 16.2892C21.2484 15.2615 21.25 13.9068 21.25 12C21.25 11.5541 21.2499 11.1384 21.248 10.75H2.75199ZM21.2239 9.25H2.77607C2.79564 8.66327 2.82987 8.15634 2.88976 7.71085C3.02502 6.70476 3.27869 6.12511 3.7019 5.7019C4.12511 5.27869 4.70476 5.02502 5.71085 4.88976C6.73851 4.75159 8.09318 4.75 10 4.75H14C15.9068 4.75 17.2615 4.75159 18.2892 4.88976C19.2952 5.02502 19.8749 5.27869 20.2981 5.7019C20.7213 6.12511 20.975 6.70476 21.1102 7.71085C21.1701 8.15634 21.2044 8.66327 21.2239 9.25ZM5.25 16C5.25 15.5858 5.58579 15.25 6 15.25H10C10.4142 15.25 10.75 15.5858 10.75 16C10.75 16.4142 10.4142 16.75 10 16.75H6C5.58579 16.75 5.25 16.4142 5.25 16ZM11.75 16C11.75 15.5858 12.0858 15.25 12.5 15.25H14C14.4142 15.25 14.75 15.5858 14.75 16C14.75 16.4142 14.4142 16.75 14 16.75H12.5C12.0858 16.75 11.75 16.4142 11.75 16Z"
              fill="currentColor"
            />
          </svg>
          <h3 className="text-xl font-semibold">{displayName}</h3>
        </div>
        <a
          href={portalUrl}
          target="_self"
          className="mt-4 block w-full rounded-md bg-gradient-to-r from-blue-500 to-purple-500 py-2 px-4 text-center text-white shadow transition duration-300 ease-in-out"
        >
          Manage
        </a>
      </div>
    </div>
  );
};

const SubscriptionManager: React.FC<Props> = ({
  subscriptions,
  isLoading,
  error,
}) => {
  return (
    <div className="mx-auto mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-8 text-center text-gray-300">
        <h2 className="mb-3 text-xl font-bold">Your Subscriptions</h2>
        <p className="text-lg">
          View subscription invoices, update payment details, and manage your
          deal.ai subscriptions.
        </p>
        <p className="text-lg">
          (One-time only purchases such as Academy access will not show here.)
        </p>
      </div>
      {!isLoading && error && (
        <p className="mx-auto w-1/2 text-center text-lg">
          We couldn't get your subscription information from our payment
          processor. Please try refreshing the page or come back later.
        </p>
      )}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {subscriptions?.flatMap(subscription =>
              subscription.roles
                .filter(role => role !== "academy")
                .map(role => (
                  <SubscriptionCard
                    key={role}
                    role={role}
                    portalUrl={subscription.portalUrl}
                  />
                ))
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SubscriptionManager;
