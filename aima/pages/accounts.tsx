import withAuth from "@/helpers/withAuth";
import { USER_ROLES } from "@/utils/roles";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { EntityTypeSvg } from "@/components/icons/SVGData";
import {
  accountApi,
  useCreateAccountMutation,
} from "@/store/features/accountApi";
import AccountList from "@/components/accounts/AccountList";
import Link from "next/link";

import {
  getLongLiveToken,
  getUserInfoFromMeta,
} from "@/store/features/facebookApi";

type Props = {};

const Accounts = (props: Props) => {
  const router = useRouter();

  const { data: accounts = [], refetch: refetchaccounts } =
    accountApi.useGetAccountsQuery();

  const { data } = accountApi.useGetCSRFQuery();

  const [createAccount] = useCreateAccountMutation();

  const [urlFragment, setUrlFragment] = useState("");
  const [hostname, setHostname] = useState("");

  const getUserInfo = async (fragment: string) => {
    // Use a regular expression to extract the access_token
    const accessTokenMatch = fragment.match(/access_token=([^&]+)/);

    // Check if a match was found
    if (accessTokenMatch && accessTokenMatch[1]) {
      const accessToken = accessTokenMatch[1];

      await getLongLiveToken(accessToken)
        .then(async result => {
          let accountData = {
            accessToken: result.access_token,
            expiresIn: result.expires_in,
            csrfToken: data && data.csrfToken?.toString(),
            name: "",
            facebookId: "",
          };

          await getUserInfoFromMeta(result?.access_token)
            .then(async userInfo => {
              accountData.name = userInfo?.name;
              accountData.facebookId = userInfo?.id;

              try {
                const response = await createAccount(accountData);

                // Check for the presence of the 'error' property
                if ("error" in response) {
                  console.error("Error creating account:", response.error);
                  // Handle error, show error message, etc.
                } else {
                  refetchaccounts();
                  // Handle success, update UI, etc.
                }
              } catch (error) {
                console.error("Error creating account:", error);
                // Handle error, show error message, etc.
              }
            })
            .catch(err => {
              console.error("===========err=========>", err);
            });
        })
        .catch(err => {
          console.error("===========err=========>", err);
        });
    } else {
      console.error("Access Token not found in the string.");
    }
  };

  useEffect(() => {
    if (router.isReady) {
      const fragment = window.location.hash.substring(1);

      const updateFragment = () => {
        setUrlFragment(fragment);
      };

      updateFragment();

      router.events.on("routeChangeComplete", updateFragment);

      return () => {
        router.events.off("routeChangeComplete", updateFragment);
      };
    }
  }, [router.events, router.isReady]);

  useEffect(() => {
    if (router.isReady && urlFragment?.length > 0 && data) {
      getUserInfo(urlFragment);
    }
  }, [urlFragment, router.isReady, data]);

  useEffect(() => {
    const currentHostname = `${window.location.protocol}//${window.location.host}`;
    setHostname(currentHostname);
  }, []);

  return (
    <>
      <div className="p-3">
        <div className="my-3 flex items-center pt-2">
          <EntityTypeSvg />
          <h2 className="ml-3 text-2xl font-bold">Add Business Accounts</h2>
        </div>

        <AccountList accounts={accounts} />
        <div className="mt-6 flex justify-start">
          <div className="mt-6 flex justify-start">
            {data && (
              <button
                type="button"
                className="btn btn-primary mt-5 "
                style={{
                  background: "#1877f2",
                  borderRadius: 6,
                }}
              >
                <Link
                  href={`https://www.facebook.com/v18.0/dialog/oauth?client_id=1345961409359181&redirect_uri=${hostname}/ai-advertising&state=${
                    data && data.csrfToken
                  }&config_id=385554197177403&response_type=token`}
                  legacyBehavior
                >
                  <a target="_blank">Login with Facebook</a>
                </Link>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default withAuth(Accounts, USER_ROLES);
